import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import FormInput from './form/FormInput';
import PhoneInput from './form/PhoneInput';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';
import { Card, CardContent } from "@/components/ui/card";
import { 
  useMunicipalities, 
  fetchStreets, 
  fetchHouseNumbers,
  Municipality,
  Street,
  HouseNumber
} from '@/hooks/useAddressLookup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface FormData {
  fornavn: string;
  etternavn: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
  kommune: string;
  kommuneId: string;
  gate: string;
  gateId: string;
  husnummer: string;
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

const NorskForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fornavn: '',
    etternavn: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    kommune: '',
    kommuneId: '',
    gate: '',
    gateId: '',
    husnummer: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Autocomplete state
  const [kommuneQuery, setKommuneQuery] = useState('');
  const [gateQuery, setGateQuery] = useState('');
  const [kommuneOptions, setKommuneOptions] = useState<Municipality[]>([]);
  const [gateOptions, setGateOptions] = useState<Street[]>([]);
  const [husnummerOptions, setHusnummerOptions] = useState<HouseNumber[]>([]);
  
  const getMunicipalities = useMunicipalities();

  // Fetch municipalities when query changes
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (kommuneQuery.length >= 2) {
        const options = await getMunicipalities(kommuneQuery);
        setKommuneOptions(options);
      } else {
        setKommuneOptions([]);
      }
    };
    
    const timeoutId = setTimeout(fetchMunicipalities, 300);
    return () => clearTimeout(timeoutId);
  }, [kommuneQuery]);

  // Fetch streets when municipality and query changes
  useEffect(() => {
    const fetchStreetOptions = async () => {
      if (formData.kommuneId && gateQuery.length >= 2) {
        const options = await fetchStreets(formData.kommuneId, gateQuery);
        setGateOptions(options);
      } else {
        setGateOptions([]);
      }
    };
    
    const timeoutId = setTimeout(fetchStreetOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.kommuneId, gateQuery]);

  // Fetch house numbers when street is selected
  useEffect(() => {
    const loadHouseNumbers = async () => {
      if (formData.kommuneId && formData.gateId) {
        const options = await fetchHouseNumbers(formData.kommuneId, formData.gateId);
        setHusnummerOptions(options);
      } else {
        setHusnummerOptions([]);
      }
    };
    
    loadHouseNumbers();
  }, [formData.kommuneId, formData.gateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error when user starts typing again
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear the error when user starts typing again
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKommuneSelect = (municipality: Municipality) => {
    setFormData(prev => ({
      ...prev,
      kommune: municipality.name,
      kommuneId: municipality.id,
      gate: '',
      gateId: '',
      husnummer: '',
      postnummer: '',
      poststed: ''
    }));
    setKommuneQuery(municipality.name);
    setKommuneOptions([]);
    
    if (errors.kommune) {
      setErrors(prev => ({ ...prev, kommune: undefined }));
    }
  };

  const handleGateSelect = (street: Street) => {
    setFormData(prev => ({
      ...prev,
      gate: street.name,
      gateId: street.id,
      husnummer: '',
      postnummer: '',
      poststed: ''
    }));
    setGateQuery(street.name);
    setGateOptions([]);
    
    if (errors.gate) {
      setErrors(prev => ({ ...prev, gate: undefined }));
    }
  };

  const handleHusnummerSelect = (husnummer: string) => {
    const selected = husnummerOptions.find(h => h.label === husnummer);
    
    if (selected) {
      setFormData(prev => ({
        ...prev,
        husnummer: selected.label,
        postnummer: selected.postnr,
        poststed: selected.poststed,
        adresse: `${formData.gate} ${selected.label}`
      }));
      
      if (errors.husnummer) {
        setErrors(prev => ({ ...prev, husnummer: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
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
          telefon: '',
          adresse: '',
          postnummer: '',
          poststed: '',
          kommune: '',
          kommuneId: '',
          gate: '',
          gateId: '',
          husnummer: ''
        });
        setKommuneQuery('');
        setGateQuery('');
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate>
          {/* Side by side name fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormInput
              id="fornavn"
              label="Fornavn"
              value={formData.fornavn}
              onChange={handleChange}
              hasError={!!errors.fornavn}
              errorMessage={errors.fornavn}
              placeholder="Skriv inn fornavn"
            />
            
            <FormInput
              id="etternavn"
              label="Etternavn"
              value={formData.etternavn}
              onChange={handleChange}
              hasError={!!errors.etternavn}
              errorMessage={errors.etternavn}
              placeholder="Skriv inn etternavn"
            />
          </div>
          
          <PhoneInput
            value={formData.telefon}
            onChange={(value) => handleFieldChange('telefon', value)}
            hasError={!!errors.telefon}
            errorMessage={errors.telefon}
          />
          
          {/* Kommune autocomplete */}
          <div className="mb-4">
            <label htmlFor="kommune" className="block text-sm font-medium text-norsk-dark mb-1">
              Kommune
            </label>
            <div className="relative">
              <Input
                id="kommune"
                value={kommuneQuery}
                onChange={(e) => setKommuneQuery(e.target.value)}
                className="w-full"
                placeholder="Skriv inn kommune"
              />
              {kommuneOptions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {kommuneOptions.map((kommune) => (
                    <li
                      key={kommune.id}
                      onClick={() => handleKommuneSelect(kommune)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {kommune.name}
                    </li>
                  ))}
                </ul>
              )}
              {errors.kommune && <p className="text-norsk-red text-sm mt-1">{errors.kommune}</p>}
            </div>
          </div>
          
          {/* Gate and Husnummer side by side - only show when kommune is selected */}
          {formData.kommuneId && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Gate autocomplete */}
              <div>
                <label htmlFor="gate" className="block text-sm font-medium text-norsk-dark mb-1">
                  Gate - eller stedsadresse
                </label>
                <div className="relative">
                  <Input
                    id="gate"
                    value={gateQuery}
                    onChange={(e) => setGateQuery(e.target.value)}
                    className="w-full"
                    placeholder="Skriv inn gatenavn"
                  />
                  {gateOptions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {gateOptions.map((gate) => (
                        <li
                          key={gate.id}
                          onClick={() => handleGateSelect(gate)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {gate.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.gate && <p className="text-norsk-red text-sm mt-1">{errors.gate}</p>}
                </div>
              </div>

              {/* Husnummer dropdown */}
              <div>
                <label htmlFor="husnummer" className="block text-sm font-medium text-norsk-dark mb-1">
                  Husnummer
                </label>
                <Select
                  disabled={!formData.gateId || husnummerOptions.length === 0}
                  value={formData.husnummer}
                  onValueChange={handleHusnummerSelect}
                >
                  <SelectTrigger className="bg-gray-100 w-full">
                    <SelectValue placeholder="Velg husnummer" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {husnummerOptions.map((num) => (
                      <SelectItem key={num.label} value={num.label}>
                        {num.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.husnummer && <p className="text-norsk-red text-sm mt-1">{errors.husnummer}</p>}
              </div>
            </div>
          )}
          
          {/* Postnummer and Poststed side by side - readonly */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="postnummer" className="block text-sm font-medium text-norsk-dark mb-1">
                PostNr.
              </label>
              <Input
                id="postnummer"
                name="postnummer"
                value={formData.postnummer}
                onChange={handleChange}
                className="w-full bg-gray-50"
                readOnly={true}
                placeholder=""
              />
              {errors.postnummer && <p className="text-norsk-red text-sm mt-1">{errors.postnummer}</p>}
            </div>
            
            <div>
              <label htmlFor="poststed" className="block text-sm font-medium text-norsk-dark mb-1">
                Poststed
              </label>
              <Input
                id="poststed"
                name="poststed"
                value={formData.poststed}
                onChange={handleChange}
                className="w-full bg-gray-50"
                readOnly={true}
                placeholder=""
              />
              {errors.poststed && <p className="text-norsk-red text-sm mt-1">{errors.poststed}</p>}
            </div>
          </div>
          
          <SubmitButton isSubmitting={isSubmitting} />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
