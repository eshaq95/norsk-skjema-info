
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Municipality, useMunicipalities } from '@/hooks/useAddressLookup';
import { Loader2 } from 'lucide-react';

interface MunicipalityInputProps {
  onMunicipalitySelect: (municipality: Municipality) => void;
  error?: string;
}

const MunicipalityInput: React.FC<MunicipalityInputProps> = ({ onMunicipalitySelect, error }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Municipality[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const getMunicipalities = useMunicipalities();
  
  // Fetch municipalities when query changes
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (query.length >= 2) {
        setLoading(true);
        console.log('Fetching municipalities for query:', query);
        const options = await getMunicipalities(query);
        console.log('Municipality options received:', options);
        setOptions(options);
        setLoading(false);
        setIsOpen(true);
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    };
    
    const timeoutId = setTimeout(fetchMunicipalities, 300);
    return () => clearTimeout(timeoutId);
  }, [query, getMunicipalities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    // Close dropdown when focus moves to another input
    const handleFocusOut = (event: FocusEvent) => {
      // Small delay to allow click events to process first
      setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }, 100);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleSelect = (municipality: Municipality) => {
    console.log('Selected municipality:', municipality);
    setQuery(municipality.name);
    onMunicipalitySelect(municipality);
    setIsOpen(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent immediate closing
    if (query.length >= 2 && options.length > 0) {
      setIsOpen(true);
    }
  };
  
  const handleBlur = () => {
    // Delayed closing to allow click events to process first
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label htmlFor="kommune" className="block text-sm font-medium text-norsk-dark mb-1">
        Kommune
      </label>
      <div className="relative">
        <Input
          id="kommune"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
          placeholder="Skriv inn kommune (minst 2 bokstaver)"
          onClick={handleInputClick}
          onFocus={() => query.length >= 2 && options.length > 0 && setIsOpen(true)}
          onBlur={handleBlur}
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {isOpen && options.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
            {options.map((kommune) => (
              <li
                key={kommune.id}
                onClick={() => handleSelect(kommune)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {kommune.name}
              </li>
            ))}
          </ul>
        )}
        
        {query.length >= 2 && !loading && isOpen && options.length === 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 mt-1">
            <p className="text-sm text-gray-500">Ingen treff</p>
          </div>
        )}
        
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default MunicipalityInput;
