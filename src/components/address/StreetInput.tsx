
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { fetchStreets, Street } from '@/hooks/useAddressLookup';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

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
  const [apiError, setApiError] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const errorCountRef = useRef(0);
  
  // Reset input when municipality changes
  useEffect(() => {
    setInputValue('');
    setSelected(null);
    setOptions([]);
    errorCountRef.current = 0;
  }, [municipalityId]);
  
  // Fetch streets when input changes with debounce
  useEffect(() => {
    // Only fetch if municipality is selected, and input has at least 2 chars
    if (!municipalityId || inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    const fetchStreetOptions = async () => {
      setLoading(true);
      try {
        const streets = await fetchStreets(municipalityId, inputValue);
        console.log('Streets fetched:', streets);
        setOptions(streets);
        setApiError(false);
        errorCountRef.current = 0; // Reset error count on success
      } catch (error) {
        console.error('Error fetching streets:', error);
        setOptions([]);
        errorCountRef.current += 1;
        
        // Only show error dialog if we've had multiple consecutive failures
        if (errorCountRef.current > 2) {
          setApiError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Set a new debounce timer (300ms for better responsiveness)
    debounceTimerRef.current = setTimeout(fetchStreetOptions, 300);
    
    // Cleanup timer on component unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [municipalityId, inputValue]);

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

  const handleCloseError = () => {
    setApiError(false);
    // Provide feedback to user about manual entry option
    toast({
      title: "Manuell adresse",
      description: "Du kan skrive inn adressen manuelt eller prøve søket igjen senere.",
    });
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
          placeholder={disabled ? "Velg kommune først" : "Skriv inn gatenavn (minst 2 bokstaver)"}
          onClick={handleInputClick}
          onFocus={() => inputValue.length >= 2 && !disabled && setIsOpen(true)}
          onBlur={handleBlur}
          autoComplete="off"
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
              Vi kunne ikke hente gateadresser akkurat nå. Dette kan skyldes nettverksproblemer eller at tjenesten er midlertidig utilgjengelig. Du kan skrive inn adressen manuelt eller prøve igjen senere.
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

export default StreetInput;
