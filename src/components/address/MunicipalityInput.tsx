
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Municipality, useMunicipalities } from '@/hooks/useAddressLookup';

interface MunicipalityInputProps {
  onMunicipalitySelect: (municipality: Municipality) => void;
  error?: string;
}

const MunicipalityInput: React.FC<MunicipalityInputProps> = ({ onMunicipalitySelect, error }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Municipality[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const getMunicipalities = useMunicipalities();
  
  // Fetch municipalities when query changes
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (query.length >= 2) {
        console.log('Fetching municipalities for query:', query);
        const options = await getMunicipalities(query);
        console.log('Municipality options received:', options);
        setOptions(options);
        setIsOpen(options.length > 0);
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    };
    
    const timeoutId = setTimeout(fetchMunicipalities, 300);
    return () => clearTimeout(timeoutId);
  }, [query, getMunicipalities]);

  const handleSelect = (municipality: Municipality) => {
    console.log('Selected municipality:', municipality);
    setQuery(municipality.name);
    onMunicipalitySelect(municipality);
    setIsOpen(false);
  };

  return (
    <div className="mb-4">
      <label htmlFor="kommune" className="block text-sm font-medium text-norsk-dark mb-1">
        Kommune
      </label>
      <div className="relative">
        <Input
          id="kommune"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
          placeholder="Skriv inn kommune"
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {isOpen && options.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((kommune) => (
              <li
                key={kommune.id}
                onClick={() => handleSelect(kommune)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {kommune.name}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default MunicipalityInput;
