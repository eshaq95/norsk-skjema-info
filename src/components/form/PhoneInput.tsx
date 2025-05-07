
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2 mb-4">
      <Label htmlFor="telefon" className="font-medium">Telefonnummer</Label>
      <Input
        id="telefon"
        name="telefon"
        type="tel"
        value={value}
        onChange={handlePhoneInput}
        className={hasError ? 'ring-2 ring-destructive' : ''}
        placeholder="Skriv inn telefonnummer"
      />
      {hasError && errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
      <p className="text-xs text-muted-foreground">Format: 123 45 678 eller +47 123 45 678</p>
    </div>
  );
};

export default PhoneInput;
