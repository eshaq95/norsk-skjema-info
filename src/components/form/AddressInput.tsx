
import React, { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
}) => {
  const [addressFocused, setAddressFocused] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePlaceSelected = (address: string) => {
    onChange(address);
  };

  useGooglePlaces({ 
    inputRef: addressInputRef, 
    onPlaceSelected: handlePlaceSelected 
  });

  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor="adresse" className="font-medium">Adresse</Label>
      <Input
        id="adresse"
        name="adresse"
        value={value}
        onChange={handleAddressChange}
        ref={addressInputRef}
        onFocus={() => setAddressFocused(true)}
        onBlur={() => setAddressFocused(false)}
        className={`${hasError ? 'ring-2 ring-destructive' : ''} ${addressFocused ? 'ring-2 ring-primary/30' : ''}`}
        placeholder="Gatenavn 123, Postnummer Oslo"
      />
      {hasError && errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
      <p className="text-xs text-muted-foreground">Start å skrive for adresseforslag</p>
    </div>
  );
};

export default AddressInput;
