
import React from 'react';
import { Button } from "@/components/ui/button";

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
      <Button 
        type="submit" 
        className={`w-full bg-norsk-blue hover:bg-norsk-blue/90 text-white ${className}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingText : text}
      </Button>
    </div>
  );
};

export default SubmitButton;
