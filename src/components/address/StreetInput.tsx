
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { fetchStreets, Street } from '@/hooks/useAddressLookup';
import { Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  
  // Fetch streets when municipality and query changes
  useEffect(() => {
    const fetchStreetOptions = async () => {
      if (municipalityId && query.length >= 2) {
        setLoading(true);
        console.log('Fetching streets for municipality:', municipalityId, 'query:', query);
        const options = await fetchStreets(municipalityId, query);
        console.log('Street options received:', options);
        setOptions(options);
        setLoading(false);
        setIsOpen(true);
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    };
    
    const timeoutId = setTimeout(fetchStreetOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [municipalityId, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelect = (street: Street) => {
    console.log('Selected street:', street);
    setQuery(street.name);
    onStreetSelect(street);
    setIsOpen(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent immediate closing
    if (query.length >= 2 && options.length > 0) {
      setIsOpen(true);
    }
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
          onClick={handleInputClick}
          onFocus={() => query.length >= 2 && options.length > 0 && setIsOpen(true)}
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isOpen && options.length > 0 && (
          <ul className="absolute z-[100] w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
            {options.map((gate) => (
              <li
                key={gate.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(gate);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {gate.name}
              </li>
            ))}
          </ul>
        )}
        
        {query.length >= 2 && !loading && isOpen && options.length === 0 && (
          <div className="absolute z-[100] w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 mt-1">
            <p className="text-sm text-gray-500">Ingen treff</p>
          </div>
        )}
        
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default StreetInput;
