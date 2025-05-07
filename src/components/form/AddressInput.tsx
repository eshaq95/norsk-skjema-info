
import React, { useRef, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import FormInput from './FormInput';

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
    <FormInput
      id="adresse"
      label="Adresse"
      value={value}
      onChange={handleAddressChange}
      hasError={hasError}
      errorMessage={errorMessage}
      inputRef={addressInputRef}
      onFocus={() => setAddressFocused(true)}
      onBlur={() => setAddressFocused(false)}
      className={addressFocused ? 'ring-2 ring-norsk-blue-light' : ''}
      placeholder="Gatenavn 123, Postnummer Oslo"
      description="Start å skrive for adresseforslag"
    />
  );
};

export default AddressInput;
