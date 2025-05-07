
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="w-full max-w-3xl mx-auto shadow-md">
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
          
          <SubmitButton isSubmitting={isSubmitting} />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
