
import React, { useState, useEffect } from 'react';
import MunicipalityInput from './MunicipalityInput';
import StreetInput from './StreetInput';
import HouseNumberInput from './HouseNumberInput';
import PostalDisplay from './PostalDisplay';
import { Municipality, Street, HouseNumber, fetchHouseNumbers } from '@/hooks/useAddressLookup';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AddressSectionProps {
  formData: {
    kommune: string;
    kommuneId: string;
    gate: string;
    gateId: string;
    husnummer: string;
    postnummer: string;
    poststed: string;
  };
  errors: {
    kommune?: string;
    gate?: string;
    husnummer?: string;
    postnummer?: string;
    poststed?: string;
  };
  onAddressChange: (field: string, value: string) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ 
  formData, 
  errors, 
  onAddressChange 
}) => {
  const [husnummerOptions, setHusnummerOptions] = useState<HouseNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<boolean>(false);

  // Fetch house numbers when street is selected
  useEffect(() => {
    const loadHouseNumbers = async () => {
      if (formData.kommuneId && formData.gate) {
        setIsLoading(true);
        try {
          console.log('Fetching house numbers for street:', formData.gate);
          const options = await fetchHouseNumbers(formData.kommuneId, formData.gate);
          console.log('House number options received:', options);
          setHusnummerOptions(options);
          setApiError(false);
        } catch (error) {
          console.error('Error fetching house numbers:', error);
          setHusnummerOptions([]);
          setApiError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setHusnummerOptions([]);
      }
    };
    
    loadHouseNumbers();
  }, [formData.kommuneId, formData.gate]);

  const handleKommuneSelect = (municipality: Municipality) => {
    console.log('Selected municipality in AddressSection:', municipality);
    onAddressChange('kommune', municipality.name);
    onAddressChange('kommuneId', municipality.id);
    onAddressChange('gate', '');
    onAddressChange('gateId', '');
    onAddressChange('husnummer', '');
    onAddressChange('postnummer', '');
    onAddressChange('poststed', '');
  };

  const handleGateSelect = (street: Street) => {
    console.log('Selected street in AddressSection:', street);
    onAddressChange('gate', street.name);
    onAddressChange('gateId', street.id);
    onAddressChange('husnummer', '');
    onAddressChange('postnummer', '');
    onAddressChange('poststed', '');
  };

  const handleHusnummerSelect = (husnummer: string) => {
    const selected = husnummerOptions.find(h => h.label === husnummer);
    console.log('Selected house number in AddressSection:', husnummer, 'Details:', selected);
    
    if (selected) {
      onAddressChange('husnummer', selected.label);
      onAddressChange('postnummer', selected.postnr);
      onAddressChange('poststed', selected.poststed);
      onAddressChange('adresse', `${formData.gate} ${selected.label}`);
    }
  };

  const handleCloseError = () => {
    setApiError(false);
  };

  return (
    <>
      <MunicipalityInput 
        onMunicipalitySelect={handleKommuneSelect} 
        error={errors.kommune}
      />
      
      {/* Gate and Husnummer side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StreetInput 
          municipalityId={formData.kommuneId}
          onStreetSelect={handleGateSelect}
          error={errors.gate}
          disabled={!formData.kommuneId} 
        />

        <HouseNumberInput 
          options={husnummerOptions}
          onHouseNumberSelect={handleHusnummerSelect}
          value={formData.husnummer}
          disabled={!formData.gate || isLoading}
          error={errors.husnummer}
        />
      </div>
      
      {/* Postnummer and Poststed side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <PostalDisplay 
          postnummer={formData.postnummer}
          poststed={formData.poststed}
          errorPostnummer={errors.postnummer}
          errorPoststed={errors.poststed}
        />
      </div>

      <AlertDialog open={apiError} onOpenChange={setApiError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tilkoblingsproblem</AlertDialogTitle>
            <AlertDialogDescription>
              Vi kunne ikke hente husnummer akkurat nå. Dette kan skyldes nettverksproblemer eller at tjenesten er midlertidig utilgjengelig. Vennligst prøv igjen senere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseError}>Ok, jeg forstår</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddressSection;
