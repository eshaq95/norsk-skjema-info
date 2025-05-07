
import React from 'react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  text = 'Send inn',
  loadingText = 'Sender inn...',
  className = '',
}) => {
  return (
    <div className="mt-6">
      <button 
        type="submit" 
        className={`scandi-button w-full ${className}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingText : text}
      </button>
    </div>
  );
};

export default SubmitButton;
