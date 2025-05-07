
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
  
  return async (query: string): Promise<Municipality[]> => {
    if (query.length < 2) return [];
    
    // Cache municipalities in state for demo purposes
    if (!municipalities.length) {
      const res = await fetch(`${ETUR}/autocomplete?layers=municipality&size=356`, HDR);
      const data = await res.json();
      
      const mapped = data.features.map((f: any) => ({
        id: f.properties.id,
        name: f.properties.name,
      }));
      
      setMunicipalities(mapped);
    }
    
    return municipalities
      .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };
};

export const fetchStreets = async (municipalityId: string, query: string): Promise<Street[]> => {
  if (query.length < 2) return [];
  
  const url = `${ETUR}/autocomplete?layers=street&municipality=${municipalityId}&text=${encodeURIComponent(query)}`;
  const res = await fetch(url, HDR);
  const data = await res.json();
  
  return data.features.map((f: any) => ({
    id: f.properties.id,
    name: f.properties.name,
  }));
};

export const fetchHouseNumbers = async (municipalityId: string, streetId: string): Promise<HouseNumber[]> => {
  const url = `${ETUR}/addresses?municipality=${municipalityId}&street=${streetId}`;
  const res = await fetch(url, HDR);
  const data = await res.json();
  
  return data.features
    .map((f: any) => ({
      label: f.properties.streetNumber,
      postnr: f.properties.postCode,
      poststed: f.properties.postPlace,
    }))
    .sort((a: HouseNumber, b: HouseNumber) => a.label.localeCompare(b.label, 'no'));
};
