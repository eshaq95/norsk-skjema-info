
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PersonalInfoSection from './address/PersonalInfoSection';
import AddressSection from './address/AddressSection';

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
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border-t-4 border-t-norsk-blue">
      <CardHeader className="bg-gradient-to-r from-white to-norsk-gray/30">
        <CardTitle className="text-2xl font-bold text-norsk-blue text-center">
          Bestill NordicMelatonin™
        </CardTitle>
        <CardDescription className="text-center">
          Vi sender på 1-3 virkedager. Ingen bindingstid og ingen skjulte kostnader.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate>
          <PersonalInfoSection 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onInputChange={handleChange}
          />
          
          <AddressSection 
            formData={formData}
            errors={errors}
            onAddressChange={handleFieldChange}
          />
          
          <div className="bg-norsk-gray/30 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-norsk-dark mb-2">GeoNorge API-sikkerhet</h3>
            <p className="text-sm text-gray-700 mb-2">
              Alle tre endepunkt (kommune, gate, husnr.) er åpne og CORS-vennlige på ws.geonorge.no. 
              Dokumentasjonen anbefaler <code className="bg-gray-100 px-1 rounded">Accept: application/json</code>, 
              og du kan filtrere treff med <code className="bg-gray-100 px-1 rounded">fuzzy=true</code> for bedre hit-rate.
            </p>
          </div>
          
          <SubmitButton isSubmitting={isSubmitting} />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
