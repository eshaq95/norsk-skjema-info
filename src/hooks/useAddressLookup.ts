
import { useState, useEffect } from "react";

// Kartverket API endpoints
const KARTVERKET_BASE = "https://ws.geonorge.no";

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
        console.log('Fetching all municipalities from Kartverket');
        const res = await fetch(`${KARTVERKET_BASE}/kommuneinfo/v1/kommuner`);
        
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          return [];
        }
        
        const data = await res.json();
        municipalitiesCache = data.map((kommune: any) => ({
          id: kommune.kommunenummer,
          name: kommune.navn,
        }));
        
        console.log(`Cached ${municipalitiesCache.length} municipalities`);
      }
      
      // Filter municipalities based on query
      const lowercaseQuery = query.toLowerCase();
      const filtered = municipalitiesCache.filter(
        kommune => kommune.name.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 20); // Limit to 20 results
      
      console.log(`Found ${filtered.length} municipalities matching "${query}"`);
      return filtered;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return [];
    }
  };
  
  return fetchMunicipalities;
};

export const fetchStreets = async (municipalityId: string, query: string): Promise<Street[]> => {
  console.log('fetchStreets called with municipalityId:', municipalityId, 'query:', query);
  if (query.length < 2) return [];
  
  try {
    const url = `${KARTVERKET_BASE}/adresse/v1/sok?sok=${encodeURIComponent(query)}&kommunenummer=${municipalityId}&fuzzy=true&treffPerSide=20`;
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
    // First we need to fetch all addresses for this street
    const url = `${KARTVERKET_BASE}/adresse/v1/sok?sok=${encodeURIComponent(streetName)}&kommunenummer=${municipalityId}&treffPerSide=100`;
    console.log('Fetching house numbers from URL:', url);
    
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
    
    console.log(`Found ${numbers.length} house numbers`);
    return numbers;
  } catch (error) {
    console.error('Error fetching house numbers:', error);
    return [];
  }
};
