import { normalisePhone, isValidNorwegian, hasCountryCode, removeNorwegianCountryCode, formatDisplayPhone } from './phoneUtils';

interface FormData {
  fornavn: string;
  etternavn: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
  kommune?: string;
  gate?: string;
  husnummer?: string;
  email?: string; // Added email field
}

interface FormErrors {
  fornavn?: string;
  etternavn?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  kommune?: string;
  gate?: string;
  husnummer?: string;
  email?: string; // Added email error field
}

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Validate fornavn
  if (!formData.fornavn?.trim()) {
    errors.fornavn = 'Fornavn er påkrevd';
  }
  
  // Validate etternavn
  if (!formData.etternavn?.trim()) {
    errors.etternavn = 'Etternavn er påkrevd';
  }
  
  // Validate telefon (Norwegian phone number format)
  if (!formData.telefon?.trim()) {
    errors.telefon = 'Telefonnummer er påkrevd';
  } else {
    // Use the improved validation that handles country codes automatically
    if (!isValidNorwegian(formData.telefon)) {
      errors.telefon = 'Telefonnummer må være 8 siffer';
    }
  }
  
  // Validate email if present in formData
  if (formData.email !== undefined) {
    if (!formData.email.trim()) {
      errors.email = 'E-post er påkrevd';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ugyldig e-postadresse';
    }
  }
  
  // Validate adresse
  if (!formData.adresse?.trim()) {
    errors.adresse = 'Adresse er påkrevd';
  }
  
  // Validate postnummer
  if (!formData.postnummer?.trim()) {
    errors.postnummer = 'Postnummer er påkrevd';
  } else if (formData.postnummer.length !== 4 || !/^\d+$/.test(formData.postnummer)) {
    errors.postnummer = 'Postnummer må være 4 siffer';
  }
  
  // Validate poststed
  if (!formData.poststed?.trim()) {
    errors.poststed = 'Poststed er påkrevd';
  }
  
  return errors;
};

export const formatPhoneNumber = (value: string): string => {
  // Format the phone number as user types (for Norwegian numbers)
  if (!value) return '';
  
  // Use our improved formatting function that properly handles all country code formats
  return formatDisplayPhone(value);
};
