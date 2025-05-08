
import React, { useState, useEffect, useRef } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<Street | null>(null);
  const [options, setOptions] = useState<Street[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Reset input when municipality changes
  useEffect(() => {
    setInputValue('');
    setSelected(null);
    setOptions([]);
  }, [municipalityId]);
  
  // Fetch streets when input changes (not when selection changes)
  useEffect(() => {
    if (!isOpen || !municipalityId || inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }
    
    const fetchStreetOptions = async () => {
      setLoading(true);
      console.log('Fetching streets for municipality:', municipalityId, 'query:', inputValue);
      const options = await fetchStreets(municipalityId, inputValue);
      console.log('Street options received:', options);
      setOptions(options);
      setLoading(false);
    };
    
    const timeoutId = setTimeout(fetchStreetOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [municipalityId, inputValue, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (street: Street) => {
    console.log('Selected street:', street);
    setSelected(street);
    setInputValue(street.name);
    onStreetSelect(street);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Reset selected when user starts typing again
    if (selected) {
      setSelected(null);
    }
    
    // Show dropdown when input has at least 2 characters
    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only show dropdown if we have valid search results
    if (inputValue.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // If we have a selection but input doesn't match, restore input value
    if (selected && inputValue !== selected.name) {
      setInputValue(selected.name);
    }
    
    // Delayed closing to allow click events to process first
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div ref={dropdownRef}>
      <label htmlFor="gate" className="block text-sm font-medium text-norsk-dark mb-1">
        Gate - eller stedsadresse
      </label>
      <div className="relative">
        <Input
          id="gate"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full"
          disabled={disabled}
          placeholder={disabled ? "Velg kommune først" : "Skriv inn gatenavn"}
          onClick={handleInputClick}
          onFocus={() => inputValue.length >= 2 && !disabled && setIsOpen(true)}
          onBlur={handleBlur}
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isOpen && options.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
            {options.map((gate) => (
              <li
                key={gate.id}
                onClick={() => handleSelect(gate)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {gate.name}
              </li>
            ))}
          </ul>
        )}
        
        {inputValue.length >= 2 && !loading && isOpen && options.length === 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 mt-1">
            <p className="text-sm text-gray-500">Ingen treff</p>
          </div>
        )}
        
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default StreetInput;
