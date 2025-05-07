
import { useState } from "react";

const ETUR = "https://api.entur.io/geocoder/v1";
const HDR = { headers: { "ET-Client-Name": "norsk-skjema-app" } };

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

export const useMunicipalities = () => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  
  const fetchMunicipalities = async (query: string): Promise<Municipality[]> => {
    console.log('Fetching municipalities with query:', query);
    if (query.length < 2) return [];
    
    try {
      // Cache municipalities in state for demo purposes
      if (!municipalities.length) {
        console.log('Fetching all municipalities from Entur API...');
        const res = await fetch(`${ETUR}/autocomplete?layers=municipality&size=356`, HDR);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.features || !Array.isArray(data.features)) {
          console.error('Unexpected API response format:', data);
          return [];
        }
        
        const mapped = data.features.map((f: any) => ({
          id: f.properties.id,
          name: f.properties.name,
        }));
        
        console.log(`Fetched ${mapped.length} municipalities`);
        setMunicipalities(mapped);
        
        // Return filtered results for first query
        return mapped
          .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);
      }
      
      // Return from cached results
      const filtered = municipalities
        .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
      
      console.log(`Found ${filtered.length} matching municipalities for "${query}"`);
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
    const url = `${ETUR}/autocomplete?layers=street&municipality=${municipalityId}&text=${encodeURIComponent(query)}`;
    console.log('Fetching streets from URL:', url);
    const res = await fetch(url, HDR);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.features || !Array.isArray(data.features)) {
      console.error('Unexpected API response format for streets:', data);
      return [];
    }
    
    const streets = data.features.map((f: any) => ({
      id: f.properties.id,
      name: f.properties.name,
    }));
    
    console.log(`Found ${streets.length} matching streets`);
    return streets;
  } catch (error) {
    console.error('Error fetching streets:', error);
    return [];
  }
};

export const fetchHouseNumbers = async (municipalityId: string, streetId: string): Promise<HouseNumber[]> => {
  console.log('fetchHouseNumbers called with municipalityId:', municipalityId, 'streetId:', streetId);
  try {
    const url = `${ETUR}/addresses?municipality=${municipalityId}&street=${streetId}`;
    console.log('Fetching house numbers from URL:', url);
    const res = await fetch(url, HDR);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.features || !Array.isArray(data.features)) {
      console.error('Unexpected API response format for house numbers:', data);
      return [];
    }
    
    const numbers = data.features
      .map((f: any) => ({
        label: f.properties.streetNumber,
        postnr: f.properties.postCode,
        poststed: f.properties.postPlace,
      }))
      .sort((a: HouseNumber, b: HouseNumber) => a.label.localeCompare(b.label, 'no'));
    
    console.log(`Found ${numbers.length} house numbers`);
    return numbers;
  } catch (error) {
    console.error('Error fetching house numbers:', error);
    return [];
  }
};
