
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import FormInput from './form/FormInput';
import PhoneInput from './form/PhoneInput';
import AddressInput from './form/AddressInput';
import PostalCodeInput from './form/PostalCodeInput';
import SubmitButton from './form/SubmitButton';
import PrivacyNotice from './form/PrivacyNotice';
import { validateForm } from '@/utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
}

interface FormErrors {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
}

const NorskForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fornavn: '',
    etternavn: '',
    epost: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    poststed: '',
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

  const handlePostnummerChange = (postnummer: string, poststed?: string) => {
    setFormData(prev => ({
      ...prev,
      postnummer,
      ...(poststed ? { poststed } : {})
    }));

    if (errors.postnummer) {
      setErrors(prev => ({ ...prev, postnummer: undefined }));
    }

    if (poststed && errors.poststed) {
      setErrors(prev => ({ ...prev, poststed: undefined }));
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
          postnummer: '',
          poststed: '',
        });
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="bg-norsk-blue text-white rounded-t-md">
        <CardTitle className="text-xl font-medium">Personlig Informasjon</CardTitle>
      </CardHeader>
      
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
          </div>
          
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
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <PostalCodeInput
              postnummer={formData.postnummer}
              poststed={formData.poststed}
              onPostnummerChange={handlePostnummerChange}
              onPoststedChange={(value) => handleFieldChange('poststed', value)}
              hasError={!!errors.postnummer || !!errors.poststed}
              errorMessage={errors.postnummer || errors.poststed}
            />
            
            <FormInput
              id="poststed"
              label="Poststed"
              value={formData.poststed}
              onChange={handleChange}
              hasError={!!errors.poststed}
              errorMessage={errors.poststed}
              readOnly={true}
              className="bg-gray-50"
            />
          </div>
          
          <SubmitButton isSubmitting={isSubmitting} />
          
          <PrivacyNotice />
        </form>
      </CardContent>
    </Card>
  );
};

export default NorskForm;
