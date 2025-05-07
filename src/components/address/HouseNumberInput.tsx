
import React from 'react';
import { HouseNumber } from '@/hooks/useAddressLookup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HouseNumberInputProps {
  options: HouseNumber[];
  onHouseNumberSelect: (husnummer: string) => void;
  value: string;
  disabled?: boolean;
  error?: string;
}

const HouseNumberInput: React.FC<HouseNumberInputProps> = ({ 
  options, 
  onHouseNumberSelect, 
  value, 
  disabled,
  error 
}) => {
  return (
    <div>
      <label htmlFor="husnummer" className="block text-sm font-medium text-norsk-dark mb-1">
        Husnummer
      </label>
      <Select
        disabled={disabled || options.length === 0}
        value={value}
        onValueChange={onHouseNumberSelect}
      >
        <SelectTrigger id="husnummer" className="w-full bg-white">
          <SelectValue placeholder={disabled ? "Velg gate først" : "Velg husnummer"} />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {options.map((num) => (
            <SelectItem key={num.label} value={num.label}>
              {num.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-norsk-red text-sm mt-1">{error}</p>}
    </div>
  );
};

export default HouseNumberInput;
