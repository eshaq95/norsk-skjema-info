
import { normalisePhone, isValidNorwegian } from './phoneUtils';

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
    // Use the improved validation from phoneUtils
    const normalized = normalisePhone(formData.telefon);
    if (!isValidNorwegian(formData.telefon)) {
      errors.telefon = 'Telefonnummer må være 8 siffer uten landskode';
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
  
  // Do not format numbers with more than 8 digits to avoid encouraging users
  // to enter numbers with country codes
  if (phoneNum.length > 8) {
    return value;
  }
  
  // Apply Norwegian phone number formatting (without country code)
  if (phoneNum.length <= 3) {
    return phoneNum;
  }
  if (phoneNum.length <= 5) {
    return `${phoneNum.substring(0, 3)} ${phoneNum.substring(3)}`;
  }
  return `${phoneNum.substring(0, 3)} ${phoneNum.substring(3, 5)} ${phoneNum.substring(5)}`;
};
