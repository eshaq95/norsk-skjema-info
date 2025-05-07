
// Type definitions for Google Places API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
      };
    };
    initAutocomplete: () => void;
  }
}

declare namespace google.maps.places {
  interface AutocompleteOptions {
    types?: string[];
    componentRestrictions?: {
      country: string | string[];
    };
  }

  interface Autocomplete {
    addListener: (event: string, callback: () => void) => void;
    getPlace: () => {
      formatted_address?: string;
      geometry?: {
        location: {
          lat: () => number;
          lng: () => number;
        };
      };
    };
  }
}

export {};
