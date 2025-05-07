
import { useState, useEffect } from "react";

// Updated API endpoints that support CORS
const GEO_BASE = "https://ws.geonorge.no";

// Helper function to normalize strings for comparison (handles Norwegian characters)
const canon = (s: string): string => 
  s.normalize("NFD")                // decompose diacritical marks
   .replace(/[\u0300-\u036f]/g, "") // remove diacritics
   .toLowerCase()                   // lowercase
   .trim();                         // remove extra spaces

export interface Municipality {
  id: string;
  name: string;
}

export interface Street {
  id: string;
  name: string;
}

export interface HouseNumber {
  label: string;
  postnr: string;
  poststed: string;
}

// Cache for municipalities to avoid repeated fetching
let municipalitiesCache: Municipality[] | null = null;

export const useMunicipalities = () => {
  const fetchMunicipalities = async (query: string): Promise<Municipality[]> => {
    console.log('Fetching municipalities with query:', query);
    if (query.length < 2) return [];
    
    try {
      // Fetch all municipalities once and cache them
      if (!municipalitiesCache) {
        console.log('Fetching all municipalities from Geonorge');
        const res = await fetch(`${GEO_BASE}/kommuneinfo/v1/kommuner`);
        
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          return [];
        }
        
        const data = await res.json();
        console.log("First municipality in response:", data[0]);
        
        municipalitiesCache = data.map((kommune: any) => ({
          id: kommune.kommunenummer,
          name: kommune.kommunenavn ?? kommune.kommunenavnNorsk ?? kommune.navnNorsk ?? kommune.navn ?? "",
        }));
        
        console.log(`Cached ${municipalitiesCache.length} municipalities`);
        console.log("Example first municipality:", municipalitiesCache[0]);
      }
      
      // Filter municipalities with canonical string comparison
      const canonicalQuery = canon(query);
      console.log('Canonical query:', canonicalQuery);
      
      const filtered = municipalitiesCache.filter(kommune => 
        kommune.name && canon(kommune.name).includes(canonicalQuery)
      ).slice(0, 20); // Limit to 20 results
      
      console.log(`Found ${filtered.length} municipalities matching "${query}"`, 
                  filtered.length > 0 ? filtered.map(k => k.name).join(", ") : "none");
      return filtered;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return [];
    }
  };
  
  return fetchMunicipalities;
};

// For debugging in console
if (typeof window !== 'undefined') {
  (window as any).fetchMunicipalities = async (query: string) => {
    const getMunicipalities = useMunicipalities();
    return await getMunicipalities(query);
  };
}

export const fetchStreets = async (municipalityId: string, query: string): Promise<Street[]> => {
  console.log('fetchStreets called with municipalityId:', municipalityId, 'query:', query);
  if (query.length < 2) return [];
  
  try {
    const url = `${GEO_BASE}/adresser/v1/sok` + 
                `?sok=${encodeURIComponent(query)}` + 
                `&kommunenummer=${encodeURIComponent(municipalityId)}` + 
                `&fuzzy=true&treffPerSide=20`;
    console.log('Fetching streets from URL:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.adresser || !Array.isArray(data.adresser)) {
      console.error('Unexpected API response format for streets:', data);
      return [];
    }
    
    // Create a Set to avoid duplicate streets
    const uniqueStreets = new Map<string, Street>();
    
    data.adresser.forEach((adr: any) => {
      if (adr.adressenavn && adr.adressenavn.toLowerCase().includes(query.toLowerCase())) {
        // Use the adressenavn as both id and name if no vegadresseId is available
        const id = adr.vegadresseId || adr.adressenavn;
        uniqueStreets.set(adr.adressenavn, {
          id: id,
          name: adr.adressenavn,
        });
      }
    });
    
    const streets = Array.from(uniqueStreets.values());
    console.log(`Found ${streets.length} matching streets`);
    return streets;
  } catch (error) {
    console.error('Error fetching streets:', error);
    return [];
  }
};

export const fetchHouseNumbers = async (municipalityId: string, streetName: string): Promise<HouseNumber[]> => {
  console.log('fetchHouseNumbers called with municipalityId:', municipalityId, 'streetName:', streetName);
  try {
    // First we need to get the vegadresseId for this street
    const streetUrl = `${GEO_BASE}/adresser/v1/sok` +
                      `?sok=${encodeURIComponent(streetName)}` +
                      `&kommunenummer=${encodeURIComponent(municipalityId)}` +
                      `&treffPerSide=1`;  // We just need one result to get the vegadresseId
    
    console.log('Fetching street ID from URL:', streetUrl);
    const streetRes = await fetch(streetUrl);
    
    if (!streetRes.ok) {
      throw new Error(`HTTP error! status: ${streetRes.status}`);
    }
    
    const streetData = await streetRes.json();
    
    // If we have a vegadresseId, use it to get all house numbers for this street
    if (streetData.adresser && streetData.adresser.length > 0 && streetData.adresser[0].vegadresseId) {
      const vegadresseId = streetData.adresser[0].vegadresseId;
      console.log(`Found vegadresseId: ${vegadresseId} for street ${streetName}`);
      
      // Now fetch all house numbers for this vegadresse
      const houseNumberUrl = `${GEO_BASE}/adresser/v1/adresser` +
                            `?vegadresseId=${encodeURIComponent(vegadresseId)}`;
      
      console.log('Fetching house numbers from URL:', houseNumberUrl);
      const houseNumberRes = await fetch(houseNumberUrl);
      
      if (!houseNumberRes.ok) {
        throw new Error(`HTTP error! status: ${houseNumberRes.status}`);
      }
      
      const houseNumberData = await houseNumberRes.json();
      
      if (Array.isArray(houseNumberData)) {
        // Map the response to our HouseNumber interface
        const numbers = houseNumberData.map((adr: any) => {
          let label = adr.nummer.toString();
          if (adr.bokstav) {
            label += adr.bokstav;
          }
          
          return {
            label: label,
            postnr: adr.postnummer,
            poststed: adr.poststed,
          };
        });
        
        // Sort house numbers
        const sortedNumbers = numbers.sort((a: HouseNumber, b: HouseNumber) => {
          // Try to sort numerically if possible
          const aNum = parseInt(a.label.replace(/[^0-9]/g, ''));
          const bNum = parseInt(b.label.replace(/[^0-9]/g, ''));
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            if (aNum !== bNum) return aNum - bNum;
          }
          
          // Fall back to string comparison
          return a.label.localeCompare(b.label, 'no');
        });
        
        console.log(`Found ${sortedNumbers.length} house numbers`);
        return sortedNumbers;
      }
    }
    
    // Fallback to the old method if vegadresseId approach fails
    console.log('Using fallback method for fetching house numbers');
    const url = `${GEO_BASE}/adresser/v1/sok` +
                `?sok=${encodeURIComponent(streetName)}` +
                `&kommunenummer=${encodeURIComponent(municipalityId)}` +
                `&treffPerSide=100`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.adresser || !Array.isArray(data.adresser)) {
      console.error('Unexpected API response format for house numbers:', data);
      return [];
    }
    
    const numbers = data.adresser
      .filter((adr: any) => adr.adressenavn === streetName)
      .map((adr: any) => {
        let label = adr.nummer.toString();
        if (adr.bokstav) {
          label += adr.bokstav;
        }
        
        return {
          label: label,
          postnr: adr.postnummer,
          poststed: adr.poststed,
        };
      })
      .sort((a: HouseNumber, b: HouseNumber) => {
        // Try to sort numerically if possible
        const aNum = parseInt(a.label.replace(/[^0-9]/g, ''));
        const bNum = parseInt(b.label.replace(/[^0-9]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          if (aNum !== bNum) return aNum - bNum;
        }
        
        // Fall back to string comparison
        return a.label.localeCompare(b.label, 'no');
      });
    
    console.log(`Found ${numbers.length} house numbers using fallback method`);
    return numbers;
  } catch (error) {
    console.error('Error fetching house numbers:', error);
    return [];
  }
};
