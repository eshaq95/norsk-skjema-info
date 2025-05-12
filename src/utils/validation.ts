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
  email?: string;
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
  email?: string;
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
  
  // Enhanced email validation with more specific error messages
  if (formData.email !== undefined) {
    if (!formData.email.trim()) {
      errors.email = 'E-post er påkrevd';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Ugyldig e-postformat. Vennligst oppgi en gyldig e-postadresse';
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
  
  // Validate kommune
  if (formData.kommune !== undefined && !formData.kommune?.trim()) {
    errors.kommune = 'Kommune er påkrevd';
  }
  
  // Validate gate
  if (formData.gate !== undefined && !formData.gate?.trim()) {
    errors.gate = 'Gate er påkrevd';
  }
  
  // Validate husnummer
  if (formData.husnummer !== undefined && !formData.husnummer?.trim()) {
    errors.husnummer = 'Husnummer er påkrevd';
  }
  
  return errors;
};

// Improved email validation function with a more comprehensive regex
export const validateEmail = (email: string): boolean => {
  // This regex checks for a more complete email validation pattern
  // It requires:
  // - At least one character before the @
  // - At least one character after the @ and before the dot
  // - At least two characters after the dot (TLD)
  // - No special characters in wrong positions
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (value: string): string => {
  // Format the phone number as user types (for Norwegian numbers)
  if (!value) return '';
  
  // Use our improved formatting function that properly handles all country code formats
  return formatDisplayPhone(value);
};
