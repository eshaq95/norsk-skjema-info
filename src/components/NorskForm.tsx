
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import FormInput from './form/FormInput';
import PhoneInput from './form/PhoneInput';
import AddressInput from './form/AddressInput';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';

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
    if (errors[field]) {
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
          epost: '',
          telefon: '',
          adresse: '',
        });
      }, 1000);
    }
  };

  return (
    <div className="norsk-container">
      <h2 className="norsk-header">Personlig Informasjon</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="fornavn"
          label="Fornavn"
          value={formData.fornavn}
          onChange={handleChange}
          hasError={!!errors.fornavn}
          errorMessage={errors.fornavn}
          placeholder="Ole"
        />
        
        <FormInput
          id="etternavn"
          label="Etternavn"
          value={formData.etternavn}
          onChange={handleChange}
          hasError={!!errors.etternavn}
          errorMessage={errors.etternavn}
          placeholder="Nordmann"
        />
        
        <FormInput
          id="epost"
          label="E-post"
          value={formData.epost}
          onChange={handleChange}
          type="email"
          hasError={!!errors.epost}
          errorMessage={errors.epost}
          placeholder="ole.nordmann@eksempel.no"
        />
        
        <PhoneInput
          value={formData.telefon}
          onChange={(value) => handleFieldChange('telefon', value)}
          hasError={!!errors.telefon}
          errorMessage={errors.telefon}
        />
        
        <AddressInput
          value={formData.adresse}
          onChange={(value) => handleFieldChange('adresse', value)}
          hasError={!!errors.adresse}
          errorMessage={errors.adresse}
        />
        
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
      
      <PrivacyNotice />
    </div>
  );
};

export default NorskForm;
