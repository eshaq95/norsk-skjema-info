
import React from 'react';
import { cn } from "@/lib/utils";

interface PrivacyNoticeProps {
  className?: string;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ className }) => {
  return (
    <div className={cn("mt-4 text-center text-xs text-muted-foreground", className)}>
      <p>Ved å sende inn dette skjemaet godtar du våre <a href="#" className="text-norsk-blue hover:underline font-medium">vilkår og betingelser</a>.</p>
    </div>
  );
};

export default PrivacyNotice;
