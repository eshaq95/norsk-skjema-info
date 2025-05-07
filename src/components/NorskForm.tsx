import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  adresse: string;
}

interface FormErrors {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  telefon?: string;
  adresse?: string;
}

const NorskForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fornavn: '',
    etternavn: '',
    epost: '',
    telefon: '',
    adresse: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  // Last Google Maps Places API script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Sjekk om scriptet allerede er lastet
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        initAutocomplete();
        return;
      }
      
      const script = document.createElement('script');
      // MERK: I en reell implementasjon, erstatt API_NØKKEL med din faktiske Google API-nøkkel
      script.src = `https://maps.googleapis.com/maps/api/js?key=API_NØKKEL&libraries=places&callback=initAutocomplete&language=no&region=NO`;
      script.async = true;
      script.defer = true;
      
      // Definer global callback-funksjon
      window.initAutocomplete = initAutocomplete;
      
      // Legg til script i dokumentet
      document.head.appendChild(script);

      console.log('Google Maps API script legges til');
      
      // Cleanup-funksjon for å fjerne callback når komponenten avmonteres
      return () => {
        window.initAutocomplete = () => {};
        // Fjern scriptet hvis nødvendig
        // document.head.removeChild(script);
      };
    };
    
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    if (!addressInputRef.current || !window.google?.maps?.places) {
      console.log('Google Maps Places API er ikke tilgjengelig eller input-feltet er ikke klart');
      return;
    }
    
    try {
      console.log('Initialiserer Google Places Autocomplete');
      
      // Sett opp autocomplete for adresse
      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        { 
          types: ['address'],
          componentRestrictions: { country: 'no' } // Begrens til Norge
        }
      );

      // Lytt til stedsendringer
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, adresse: place.formatted_address }));
          setErrors(prev => ({ ...prev, adresse: undefined }));
          console.log('Valgt adresse:', place.formatted_address);
        }
      });
    } catch (error) {
      console.error('Feil ved initialisering av Google Places Autocomplete:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error when user starts typing again
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate fornavn
    if (!formData.fornavn.trim()) {
      newErrors.fornavn = 'Fornavn er påkrevd';
    }
    
    // Validate etternavn
    if (!formData.etternavn.trim()) {
      newErrors.etternavn = 'Etternavn er påkrevd';
    }
    
    // Validate epost
    if (!formData.epost.trim()) {
      newErrors.epost = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.epost)) {
      newErrors.epost = 'Ugyldig e-postformat';
    }
    
    // Validate telefon (Norwegian phone number format)
    if (!formData.telefon.trim()) {
      newErrors.telefon = 'Telefonnummer er påkrevd';
    } else {
      // Remove spaces and check if it's a valid Norwegian phone number
      const phoneNum = formData.telefon.replace(/\s/g, '');
      if (!/^((\+|00)47)?[49]\d{7}$/.test(phoneNum)) {
        newErrors.telefon = 'Ugyldig telefonnummer. Bruk norsk format';
      }
    }
    
    // Validate adresse
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'Adresse er påkrevd';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        console.log('Form submitted:', formData);
        
        toast({
          title: 'Skjema sendt!',
          description: 'Din informasjon har blitt mottatt.',
        });
        
        // Reset form
        setFormData({
          fornavn: '',
          etternavn: '',
          epost: '',
          telefon: '',
          adresse: '',
        });
      }, 1000);
    }
  };

  const formatPhoneNumber = (value: string): string => {
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
  
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, telefon: formattedValue }));
  };

  return (
    <div className="norsk-container">
      <h2 className="norsk-header">Personlig Informasjon</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="scandi-form-group">
          <label htmlFor="fornavn" className="scandi-label">Fornavn</label>
          <input
            id="fornavn"
            name="fornavn"
            type="text"
            value={formData.fornavn}
            onChange={handleChange}
            className={`scandi-input w-full ${errors.fornavn ? 'ring-2 ring-norsk-red' : ''}`}
            placeholder="Ole"
          />
          {errors.fornavn && <p className="scandi-error">{errors.fornavn}</p>}
        </div>
        
        <div className="scandi-form-group">
          <label htmlFor="etternavn" className="scandi-label">Etternavn</label>
          <input
            id="etternavn"
            name="etternavn"
            type="text"
            value={formData.etternavn}
            onChange={handleChange}
            className={`scandi-input w-full ${errors.etternavn ? 'ring-2 ring-norsk-red' : ''}`}
            placeholder="Nordmann"
          />
          {errors.etternavn && <p className="scandi-error">{errors.etternavn}</p>}
        </div>
        
        <div className="scandi-form-group">
          <label htmlFor="epost" className="scandi-label">E-post</label>
          <input
            id="epost"
            name="epost"
            type="email"
            value={formData.epost}
            onChange={handleChange}
            className={`scandi-input w-full ${errors.epost ? 'ring-2 ring-norsk-red' : ''}`}
            placeholder="ole.nordmann@eksempel.no"
          />
          {errors.epost && <p className="scandi-error">{errors.epost}</p>}
        </div>
        
        <div className="scandi-form-group">
          <label htmlFor="telefon" className="scandi-label">Telefonnummer</label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            value={formData.telefon}
            onChange={handlePhoneInput}
            className={`scandi-input w-full ${errors.telefon ? 'ring-2 ring-norsk-red' : ''}`}
            placeholder="123 45 678"
          />
          {errors.telefon && <p className="scandi-error">{errors.telefon}</p>}
          <p className="text-xs text-gray-500 mt-1">Format: 123 45 678 eller +47 123 45 678</p>
        </div>
        
        <div className="scandi-form-group">
          <label htmlFor="adresse" className="scandi-label">Adresse</label>
          <input
            id="adresse"
            name="adresse"
            type="text"
            ref={addressInputRef}
            value={formData.adresse}
            onChange={handleChange}
            onFocus={() => setAddressFocused(true)}
            onBlur={() => setAddressFocused(false)}
            className={`scandi-input w-full ${errors.adresse ? 'ring-2 ring-norsk-red' : addressFocused ? 'ring-2 ring-norsk-blue-light' : ''}`}
            placeholder="Gatenavn 123, Postnummer Oslo"
          />
          {errors.adresse && <p className="scandi-error">{errors.adresse}</p>}
          <p className="text-xs text-gray-500 mt-1">Start å skrive for adresseforslag</p>
        </div>
        
        <div className="mt-6">
          <button 
            type="submit" 
            className="scandi-button w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sender inn...' : 'Send inn'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Ved å sende inn dette skjemaet godtar du våre <a href="#" className="text-norsk-blue hover:underline">vilkår og betingelser</a>.</p>
      </div>
    </div>
  );
};

export default NorskForm;
