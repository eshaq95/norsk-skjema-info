
interface FormData {
  fornavn: string;
  etternavn: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
}

interface FormErrors {
  fornavn?: string;
  etternavn?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
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
    // Remove spaces and check if it's a valid Norwegian phone number
    const phoneNum = formData.telefon.replace(/\s/g, '');
    if (!/^((\+|00)47)?[49]\d{7}$/.test(phoneNum)) {
      errors.telefon = 'Ugyldig telefonnummer. Bruk norsk format';
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
  
  // Apply Norwegian phone number formatting
  if (phoneNum.startsWith('0047') || phoneNum.startsWith('47')) {
    // Handle numbers with country code
    const countryCode = phoneNum.substring(0, phoneNum.startsWith('00') ? 4 : 2);
    const restOfNumber = phoneNum.substring(phoneNum.startsWith('00') ? 4 : 2);
    
    if (restOfNumber.length <= 3) {
      return `+${countryCode} ${restOfNumber}`;
    }
    if (restOfNumber.length <= 5) {
      return `+${countryCode} ${restOfNumber.substring(0, 3)} ${restOfNumber.substring(3)}`;
    }
    return `+${countryCode} ${restOfNumber.substring(0, 3)} ${restOfNumber.substring(3, 5)} ${restOfNumber.substring(5, 8)}`;
  } else {
    // Handle domestic numbers
    if (phoneNum.length <= 3) {
      return phoneNum;
    }
    if (phoneNum.length <= 5) {
      return `${phoneNum.substring(0, 3)} ${phoneNum.substring(3)}`;
    }
    if (phoneNum.length <= 8) {
      return `${phoneNum.substring(0, 3)} ${phoneNum.substring(3, 5)} ${phoneNum.substring(5)}`;
    }
    return phoneNum;
  }
};
