
import React, { ReactNode } from 'react';

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  errorMessage?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  description?: ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  hasError,
  errorMessage,
  type = 'text',
  placeholder,
  className = '',
  onFocus,
  onBlur,
  readOnly,
  inputRef,
  description,
}) => {
  return (
    <div className="scandi-form-group">
      <label htmlFor={id} className="scandi-label">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={readOnly}
        className={`scandi-input w-full ${hasError ? 'ring-2 ring-norsk-red' : className}`}
        placeholder={placeholder}
      />
      {hasError && errorMessage && <p className="scandi-error">{errorMessage}</p>}
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );
};

export default FormInput;
