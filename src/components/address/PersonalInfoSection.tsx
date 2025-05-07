
import React from 'react';
import FormInput from '../form/FormInput';
import PhoneInput from '../form/PhoneInput';

interface PersonalInfoSectionProps {
  formData: {
    fornavn: string;
    etternavn: string;
    telefon: string;
  };
  errors: {
    fornavn?: string;
    etternavn?: string;
    telefon?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  onFieldChange,
  onInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormInput
          id="fornavn"
          label="Fornavn"
          value={formData.fornavn}
          onChange={onInputChange}
          hasError={!!errors.fornavn}
          errorMessage={errors.fornavn}
          placeholder="Skriv inn fornavn"
        />
        
        <FormInput
          id="etternavn"
          label="Etternavn"
          value={formData.etternavn}
          onChange={onInputChange}
          hasError={!!errors.etternavn}
          errorMessage={errors.etternavn}
          placeholder="Skriv inn etternavn"
        />
      </div>
      
      <PhoneInput
        value={formData.telefon}
        onChange={(value) => onFieldChange('telefon', value)}
        hasError={!!errors.telefon}
        errorMessage={errors.telefon}
      />
    </>
  );
};

export default PersonalInfoSection;
