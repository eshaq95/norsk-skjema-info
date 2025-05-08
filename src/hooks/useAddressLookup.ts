
import { useState, useEffect } from "react";

// Updated API endpoints that support CORS
const GEO_BASE = "https://ws.geonorge.no";

// Helper function to normalize strings for comparison (handles Norwegian characters)
const canon = (s: string): string => 
  s.normalize("NFD")                // decompose diacritical marks
   .replace(/[\u0300-\u036f]/g, "") // remove diacritics
   .toLowerCase()                   // lowercase
   .trim();                         // remove extra spaces

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MUNICIPALITY_CACHE_KEY = 'geonorge_municipalities_cache';
const CACHE_TIMESTAMP_KEY = 'geonorge_municipalities_timestamp';

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

// In-memory cache for municipalities to avoid repeated fetching
let municipalitiesCache: Municipality[] | null = null;

// Helper function to get cached data
const getCachedMunicipalities = (): Municipality[] | null => {
  try {
    const timestampStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestampStr) return null;
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Return null if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(MUNICIPALITY_CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    const cachedData = localStorage.getItem(MUNICIPALITY_CACHE_KEY);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Helper function to save data to cache
const cacheMunicipalities = (data: Municipality[]): void => {
  try {
    localStorage.setItem(MUNICIPALITY_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const useMunicipalities = () => {
  const fetchMunicipalities = async (query: string): Promise<Municipality[]> => {
    console.log('Fetching municipalities with query:', query);
    if (query.length < 2) return [];
    
    try {
      // Fetch all municipalities once and cache them
      if (!municipalitiesCache) {
        // Try to get from localStorage first
        const cachedMunicipalities = getCachedMunicipalities();
        if (cachedMunicipalities) {
          console.log(`Retrieved ${cachedMunicipalities.length} municipalities from localStorage cache`);
          municipalitiesCache = cachedMunicipalities;
        } else {
          console.log('Fetching all municipalities from Geonorge');
          const res = await fetch(`${GEO_BASE}/kommuneinfo/v1/kommuner`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            throw new Error(`Feil ved henting av kommuner: ${res.status}`);
          }
          
          const data = await res.json();
          
          municipalitiesCache = data.map((kommune: any) => ({
            id: kommune.kommunenummer,
            name: kommune.kommunenavn ?? kommune.kommunenavnNorsk ?? kommune.navnNorsk ?? kommune.navn ?? "",
          }));
          
          console.log(`Cached ${municipalitiesCache.length} municipalities`);
          
          // Save to localStorage for future use
          cacheMunicipalities(municipalitiesCache);
        }
      }
      
      // Simple "startsWith" filtering approach - only return municipalities that start with the query
      const canonicalQuery = canon(query);
      
      const filtered = municipalitiesCache.filter(kommune => 
        kommune.name && canon(kommune.name).startsWith(canonicalQuery)
      ).slice(0, 20); // Limit to 20 results
      
      return filtered;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      throw error;
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

export const fetchStreets = async (
  municipalityId: string,
  query: string
): Promise<Street[]> => {
  if (query.length < 2) return [];                  // wait until ≥2 chars

  // add * BEFORE URL encoding -> terr%2A
  const sokParam = encodeURIComponent(query + "*");

  const url =
    `${GEO_BASE}/adresser/v1/sok?sok=${sokParam}` +
    `&kommunenummer=${municipalityId}` +
    `&treffPerSide=20`;                             // no fuzzy=true
    
  console.log('Fetching streets from URL:', url);
  
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error(`Street search failed: ${res.status}`);
    throw new Error(`Street search failed: ${res.status}`);
  }

  const data = await res.json();
  
  if (!data.adresser || !Array.isArray(data.adresser)) {
    console.error('Unexpected API response format for streets:', data);
    return [];
  }

  const uniq = new Map<string, Street>();
  for (const a of data.adresser) {
    if (!a.adressenavn) continue;
    uniq.set(a.adressenavn, {
      id: a.vegadresseId ?? a.adressenavn,
      name: a.adressenavn,
    });
  }

  const streets = [...uniq.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "no")
  );
  
  console.log(`Found ${streets.length} matching streets`);
  return streets;
};

export const fetchHouseNumbers = async (municipalityId: string, streetName: string): Promise<HouseNumber[]> => {
  console.log('fetchHouseNumbers called with municipalityId:', municipalityId, 'streetName:', streetName);
  try {
    // First we need to get the vegadresseId for this street
    const streetUrl = `${GEO_BASE}/adresser/v1/sok` +
                      `?sok=${encodeURIComponent(streetName)}` +
                      `&kommunenummer=${encodeURIComponent(municipalityId)}` +
                      `&fuzzy=true` + 
                      `&treffPerSide=1`;  // We just need one result to get the vegadresseId
    
    console.log('Fetching street ID from URL:', streetUrl);
    const streetRes = await fetch(streetUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
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
      const houseNumberRes = await fetch(houseNumberUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
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
                `&fuzzy=true` +
                `&treffPerSide=100`;
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
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
    throw error;
  }
};
