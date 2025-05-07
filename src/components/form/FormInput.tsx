
import React, { ReactNode } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem } from "@/components/ui/form";

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
    <div className="space-y-2 mb-4">
      <Label htmlFor={id} className="font-medium">{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={readOnly}
        className={`${hasError ? 'ring-2 ring-destructive' : ''} ${className}`}
        placeholder={placeholder}
      />
      {hasError && errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

export default FormInput;
