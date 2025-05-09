
import { normalisePhone, isValidNorwegian, hasCountryCode } from './phoneUtils';

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
}

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Validate fornavn
  if (!formData.fornavn.trim()) {
    errors.fornavn = 'Fornavn er påkrevd';
  }
  
  // Validate etternavn
  if (!formData.etternavn.trim()) {
    errors.etternavn = 'Etternavn er påkrevd';
  }
  
  // Validate telefon (Norwegian phone number format)
  if (!formData.telefon.trim()) {
    errors.telefon = 'Telefonnummer er påkrevd';
  } else {
    const normalized = normalisePhone(formData.telefon);
    
    // Check if it has country code
    if (hasCountryCode(formData.telefon)) {
      errors.telefon = 'Kun 8 siffer uten landskode (+47/0047)';
    } 
    // Check if it's exactly 8 digits
    else if (normalized.length !== 8) {
      errors.telefon = 'Telefonnummer må være 8 siffer';
    }
  }
  
  // Validate adresse
  if (!formData.adresse.trim()) {
    errors.adresse = 'Adresse er påkrevd';
  }
  
  // Validate postnummer
  if (!formData.postnummer.trim()) {
    errors.postnummer = 'Postnummer er påkrevd';
  } else if (formData.postnummer.length !== 4 || !/^\d+$/.test(formData.postnummer)) {
    errors.postnummer = 'Postnummer må være 4 siffer';
  }
  
  // Validate poststed
  if (!formData.poststed.trim()) {
    errors.poststed = 'Poststed er påkrevd';
  }
  
  return errors;
};

export const formatPhoneNumber = (value: string): string => {
  // Format the phone number as user types (for Norwegian numbers)
  if (!value) return '';
  
  // Remove all non-digits
  const phoneNum = value.replace(/\D/g, '');
  
  // Limit to 8 digits to enforce Norwegian phone number rules
  // (without country code)
  const limited = phoneNum.slice(0, 8);
  
  // Apply Norwegian phone number formatting (without country code)
  if (limited.length <= 3) {
    return limited;
  }
  if (limited.length <= 5) {
    return `${limited.substring(0, 3)} ${limited.substring(3)}`;
  }
  return `${limited.substring(0, 3)} ${limited.substring(3, 5)} ${limited.substring(5)}`;
};
