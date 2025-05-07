
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { fetchStreets, Street } from '@/hooks/useAddressLookup';

interface StreetInputProps {
  municipalityId: string;
  onStreetSelect: (street: Street) => void;
  error?: string;
  disabled?: boolean;
}

const StreetInput: React.FC<StreetInputProps> = ({ municipalityId, onStreetSelect, error, disabled }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Street[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch streets when municipality and query changes
  useEffect(() => {
    const fetchStreetOptions = async () => {
      if (municipalityId && query.length >= 2) {
        console.log('Fetching streets for municipality:', municipalityId, 'query:', query);
        const options = await fetchStreets(municipalityId, query);
        console.log('Street options received:', options);
        setOptions(options);
        setIsOpen(options.length > 0);
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    };
    
    const timeoutId = setTimeout(fetchStreetOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [municipalityId, query]);

  const handleSelect = (street: Street) => {
    console.log('Selected street:', street);
    setQuery(street.name);
    onStreetSelect(street);
    setIsOpen(false);
  };

  return (
    <div>
      <label htmlFor="gate" className="block text-sm font-medium text-norsk-dark mb-1">
        Gate - eller stedsadresse
      </label>
      <div className="relative">
        <Input
          id="gate"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
          disabled={disabled}
          placeholder={disabled ? "Velg kommune først" : "Skriv inn gatenavn"}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {isOpen && options.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((gate) => (
              <li
                key={gate.id}
                onClick={() => handleSelect(gate)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {gate.name}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default StreetInput;
