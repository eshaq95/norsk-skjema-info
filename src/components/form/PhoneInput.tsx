
import React from 'react';
import FormInput from './FormInput';
import { formatPhoneNumber } from '@/utils/validation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
}) => {
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    onChange(formattedValue);
  };

  return (
    <FormInput
      id="telefon"
      label="Telefonnummer"
      value={value}
      onChange={handlePhoneInput}
      hasError={hasError}
      errorMessage={errorMessage}
      type="tel"
      placeholder="123 45 678"
      description="Format: 123 45 678 eller +47 123 45 678"
    />
  );
};

export default PhoneInput;
