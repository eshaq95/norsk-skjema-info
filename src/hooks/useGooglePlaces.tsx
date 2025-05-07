
import { useEffect, useRef } from 'react';

// Define Google types using the @types/google.maps package
declare global {
  interface Window {
    google: typeof google;
    initAutocomplete: () => void;
  }
}

interface UseGooglePlacesProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onPlaceSelected: (place: string) => void;
}

export const useGooglePlaces = ({ inputRef, onPlaceSelected }: UseGooglePlacesProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Sjekk om scriptet allerede er lastet
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        initAutocomplete();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAnwA145fPHo1YPnMesi4Re_iM98wbNMK4&libraries=places&callback=initAutocomplete&language=no&region=NO`;
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
      };
    };
    
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.log('Google Maps API er ikke tilgjengelig eller input-feltet er ikke klart');
      return;
    }
    
    try {
      console.log('Initialiserer Google Places Autocomplete');
      
      // Sett opp autocomplete for adresse
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { 
          types: ['address'],
          componentRestrictions: { country: 'no' } // Begrens til Norge
        }
      );

      // Lytt til stedsendringer
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.formatted_address) {
          onPlaceSelected(place.formatted_address);
          console.log('Valgt adresse:', place.formatted_address);
        }
      });
    } catch (error) {
      console.error('Feil ved initialisering av Google Places Autocomplete:', error);
    }
  };

  return { autocompleteRef };
};
