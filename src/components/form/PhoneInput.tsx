
import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber, } from '@/utils/validation';
import { normalisePhone, isValidNorwegian, lookup1881, PhoneLookupResult, PhoneOwner } from '@/utils/phoneUtils';
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { debounce } from 'lodash';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

type LookupStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
}) => {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [normalizedPhone, setNormalizedPhone] = useState<string>('');
  const [phoneOwner, setPhoneOwner] = useState<PhoneOwner | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Handle phone input formatting
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    onChange(formattedValue);
    
    // Clear validation errors when user is typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Perform phone lookup with debounce - only triggered on blur
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLookup = useCallback(
    debounce(async (phone: string) => {
      if (!phone || phone.length < 8) return;
      
      const normalized = normalisePhone(phone);
      setNormalizedPhone(normalized);
      
      if (!isValidNorwegian(normalized)) {
        setValidationError('Ugyldig norsk nummer');
        setLookupStatus('error');
        setPhoneOwner(null);
        return;
      }
      
      setLookupStatus('loading');
      
      try {
        const result = await lookup1881(normalized);
        
        if (result && result.content && result.content.length > 0) {
          setPhoneOwner(result.content[0]);
          setLookupStatus('success');
        } else {
          setPhoneOwner(null);
          setLookupStatus('not-found');
        }
      } catch (error) {
        console.error('Error looking up phone number:', error);
        setLookupStatus('error');
        setPhoneOwner(null);
      }
    }, 500),
    []
  );

  // Trigger lookup ONLY when focus is lost
  const handleBlur = () => {
    setIsFocused(false);
    if (value && value.trim()) {
      debouncedLookup(value);
    }
  };

  // Get status icon based on lookup status
  const getStatusIcon = () => {
    switch (lookupStatus) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'not-found':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  // Field has error if there's a validation error or prop-based error
  const fieldHasError = !!validationError || hasError;
  
  // Error message to display
  const displayError = validationError || errorMessage;
  
  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor="telefon" className="font-medium">Telefonnummer</Label>
      <div className="relative">
        <Input
          id="telefon"
          name="telefon"
          type="tel"
          value={value}
          onChange={handlePhoneInput}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={`pr-8 ${fieldHasError ? 'ring-2 ring-destructive' : ''}`}
          placeholder="Skriv inn telefonnummer"
        />
        {value && value.length > 0 && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {getStatusIcon()}
          </div>
        )}
      </div>
      
      {fieldHasError && displayError && (
        <p className="text-sm font-medium text-destructive">{displayError}</p>
      )}
      
      {lookupStatus === 'not-found' && !fieldHasError && (
        <p className="text-sm text-muted-foreground">Nummeret er ikke oppført hos 1881.</p>
      )}
      
      {phoneOwner && lookupStatus === 'success' && (
        <div className="mt-2">
          <Label htmlFor="eier" className="font-medium">Navn</Label>
          <Input 
            id="eier" 
            value={phoneOwner.name || ''} 
            className="bg-muted/50" 
            readOnly 
          />
          {phoneOwner.address && (
            <p className="text-xs text-muted-foreground mt-1">
              {phoneOwner.address}, {phoneOwner.postnr} {phoneOwner.poststed}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
