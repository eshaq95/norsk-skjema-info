
import React, { useState, useEffect } from 'react';
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
        setIsOpen(options.length > 0);
        setLoading(false);
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
          placeholder="Skriv inn kommune (minst 2 bokstaver)"
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {isOpen && options.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2">
            <p className="text-sm text-gray-500">Ingen treff</p>
          </div>
        )}
        
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default MunicipalityInput;
