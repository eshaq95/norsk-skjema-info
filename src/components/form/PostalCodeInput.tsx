
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PostalCodeInputProps {
  postnummer: string;
  poststed: string;
  onPostnummerChange: (postnummer: string, poststed?: string) => void;
  onPoststedChange: (poststed: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
  postnummer,
  poststed,
  onPostnummerChange,
  onPoststedChange,
  hasError,
  errorMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [debounceTimerId, setDebounceTimerId] = useState<NodeJS.Timeout | null>(null);

  // Format postal code to 4 digits
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    onPostnummerChange(value);
    
    // Clear any existing debounce timer
    if (debounceTimerId) {
      clearTimeout(debounceTimerId);
    }
    
    // If we have a complete postal code (4 digits), look up the city
    if (value.length === 4) {
      // Add debounce delay of 300ms to prevent excessive API calls
      const timerId = setTimeout(() => {
        lookupPostalCode(value);
      }, 300);
      
      setDebounceTimerId(timerId);
    } else if (poststed) {
      onPoststedChange('');
    }
  };

  // Look up postal code from API
  const lookupPostalCode = async (postnummer: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.bring.com/shippingguide/api/postalCode.json?clientUrl=example.com&pnr=${postnummer}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.valid && data.result) {
        onPoststedChange(data.result);
        onPostnummerChange(postnummer, data.result);
        setApiError(false);
      } else {
        onPoststedChange('');
      }
    } catch (error) {
      console.error('Feil ved oppslag av postnummer:', error);
      onPoststedChange('');
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If postal code is 4 digits on initial load, look it up
    if (postnummer.length === 4 && !poststed) {
      lookupPostalCode(postnummer);
    }
    
    // Clean up any timers on component unmount
    return () => {
      if (debounceTimerId) {
        clearTimeout(debounceTimerId);
      }
    };
  }, []);

  const handleCloseError = () => {
    setApiError(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="postnummer" className="font-medium">Postnummer</Label>
      <Input
        id="postnummer"
        name="postnummer"
        type="text"
        inputMode="numeric"
        value={postnummer}
        onChange={handlePostalCodeChange}
        className={`${hasError ? 'ring-2 ring-destructive' : ''} ${isLoading ? 'bg-gray-50' : ''}`}
        placeholder="0000"
        maxLength={4}
      />
      {hasError && errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
      
      <AlertDialog open={apiError} onOpenChange={setApiError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tilkoblingsproblem</AlertDialogTitle>
            <AlertDialogDescription>
              Vi kunne ikke verifisere postnummeret akkurat nå. Dette kan skyldes nettverksproblemer eller at tjenesten er midlertidig utilgjengelig. Vennligst prøv igjen senere.
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

export default PostalCodeInput;
