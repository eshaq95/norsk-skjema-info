
import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from '@/utils/validation';
import { normalisePhone, isValidNorwegian, hasCountryCode, lookup1881, PhoneLookupResult, PhoneOwner } from '@/utils/phoneUtils';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { debounce } from 'lodash';
import { useToast } from "@/hooks/use-toast";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

type LookupStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error' | 'api-unavailable';

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
}) => {
  const { toast } = useToast();
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
    
    // Reset lookup status when the input changes
    if (lookupStatus !== 'idle') {
      setLookupStatus('idle');
      setPhoneOwner(null);
    }
    
    // Live validation
    const normalized = normalisePhone(formattedValue);
    if (normalized.length > 0) {
      // Check for invalid formats
      if (hasCountryCode(formattedValue)) {
        setValidationError('Kun 8 siffer uten landskode (+47/0047)');
      } else if (normalized.length > 8) {
        setValidationError('Telefonnummer må være 8 siffer');
      }
    }
  };

  // Perform phone lookup with debounce - only triggered on blur
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLookup = useCallback(
    debounce(async (phone: string) => {
      // Don't perform lookup if the field is empty
      if (!phone || phone.trim() === '') {
        setLookupStatus('idle');
        return;
      }
      
      const normalized = normalisePhone(phone);
      setNormalizedPhone(normalized);
      
      // Validate phone number format
      if (hasCountryCode(phone)) {
        setValidationError('Kun 8 siffer uten landskode (+47/0047)');
        setLookupStatus('error');
        setPhoneOwner(null);
        return;
      }
      
      // Don't lookup until we have 8 digits
      if (normalized.length !== 8) {
        setValidationError('Telefonnummer må være 8 siffer');
        setLookupStatus('error');
        return;
      }
      
      setLookupStatus('loading');
      
      try {
        const result = await lookup1881(normalized);
        
        // Check if the result is a fallback (API unavailable)
        if (result._fallback) {
          setLookupStatus('api-unavailable');
          setPhoneOwner(null);
          toast({
            title: "1881-tjenesten utilgjengelig",
            description: "Kunne ikke koble til 1881. Tjenesten kan være midlertidig nede.",
            variant: "destructive",
          });
          return;
        }
        
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

  // Trigger lookup ONLY when focus is lost and we have valid input
  const handleBlur = () => {
    setIsFocused(false);
    if (value && value.trim()) {
      const normalized = normalisePhone(value);
      
      // Check for country code
      if (hasCountryCode(value)) {
        setValidationError('Kun 8 siffer uten landskode (+47/0047)');
        setLookupStatus('error');
        return;
      }
      
      // Only attempt lookup if we have exactly 8 digits
      if (normalized.length === 8) {
        debouncedLookup(value);
      } else {
        setValidationError('Telefonnummer må være 8 siffer');
        setLookupStatus('error');
      }
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
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'api-unavailable':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
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
          placeholder="Skriv inn 8 siffer uten landskode"
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
        <p className="text-sm text-destructive">Nummeret er ikke oppført hos 1881.</p>
      )}
      
      {lookupStatus === 'api-unavailable' && !fieldHasError && (
        <p className="text-sm text-amber-500">1881-tjenesten er for øyeblikket utilgjengelig.</p>
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
