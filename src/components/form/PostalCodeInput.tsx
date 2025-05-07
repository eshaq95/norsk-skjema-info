
import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  // Format postal code to 4 digits
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    onPostnummerChange(value);
    
    // If we have a complete postal code (4 digits), look up the city
    if (value.length === 4) {
      lookupPostalCode(value);
    } else if (poststed) {
      onPoststedChange('');
    }
  };

  // Look up postal code from API
  const lookupPostalCode = async (postnummer: string) => {
    try {
      const response = await fetch(`https://api.bring.com/shippingguide/api/postalCode.json?clientUrl=example.com&pnr=${postnummer}`);
      const data = await response.json();
      
      if (data && data.valid && data.result) {
        onPoststedChange(data.result);
        onPostnummerChange(postnummer, data.result);
      } else {
        onPoststedChange('');
      }
    } catch (error) {
      console.error('Feil ved oppslag av postnummer:', error);
      onPoststedChange('');
    }
  };

  useEffect(() => {
    // If postal code is 4 digits on initial load, look it up
    if (postnummer.length === 4 && !poststed) {
      lookupPostalCode(postnummer);
    }
  }, []);

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
        className={`${hasError ? 'ring-2 ring-destructive' : ''}`}
        placeholder="0000"
        maxLength={4}
      />
      {hasError && errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default PostalCodeInput;
