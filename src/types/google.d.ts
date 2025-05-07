
// Type definitions for Google Places API
declare namespace google {
  namespace maps {
    namespace places {
      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: {
          country: string | string[];
        };
      }

      class Autocomplete {
        constructor(
          input: HTMLInputElement,
          options?: AutocompleteOptions
        );
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
  }
}

// This type definition is now handled inline in useGooglePlaces.tsx
// interface Window {
//   google: typeof google;
//   initAutocomplete: () => void;
// }

export {};
