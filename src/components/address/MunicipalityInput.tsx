
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Municipality, useMunicipalities } from '@/hooks/useAddressLookup';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MunicipalityInputProps {
  onMunicipalitySelect: (municipality: Municipality) => void;
  error?: string;
}

const MunicipalityInput: React.FC<MunicipalityInputProps> = ({ onMunicipalitySelect, error }) => {
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<Municipality | null>(null);
  const [options, setOptions] = useState<Municipality[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const getMunicipalities = useMunicipalities();
  
  // Fetch municipalities when input changes with debounce
  useEffect(() => {
    if (!isOpen || inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    const fetchMunicipalities = async () => {
      setLoading(true);
      try {
        const options = await getMunicipalities(inputValue);
        setOptions(options);
        setApiError(false);
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        setOptions([]);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    
    // Set a new debounce timer (500ms)
    debounceTimerRef.current = setTimeout(fetchMunicipalities, 500);
    
    // Cleanup timer on component unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, isOpen, getMunicipalities]);

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

  const handleSelect = (municipality: Municipality) => {
    setSelected(municipality);
    setInputValue(municipality.name);
    onMunicipalitySelect(municipality);
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

  const handleCloseError = () => {
    setApiError(false);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label htmlFor="kommune" className="block text-sm font-medium text-norsk-dark mb-1">
        Kommune
      </label>
      <div className="relative">
        <Input
          id="kommune"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full"
          placeholder="Skriv inn kommune (minst 2 bokstaver)"
          onClick={handleInputClick}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
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
        
        {inputValue.length >= 2 && !loading && isOpen && options.length === 0 && !apiError && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 mt-1">
            <p className="text-sm text-gray-500">Ingen treff</p>
          </div>
        )}
        
        {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
      </div>

      <AlertDialog open={apiError} onOpenChange={setApiError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tilkoblingsproblem</AlertDialogTitle>
            <AlertDialogDescription>
              Vi kunne ikke hente kommuner akkurat nå. Dette kan skyldes nettverksproblemer eller at tjenesten er midlertidig utilgjengelig. Vennligst prøv igjen senere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseError}>Ok, jeg forstår</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MunicipalityInput;
