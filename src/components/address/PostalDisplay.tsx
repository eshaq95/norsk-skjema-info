
import React from 'react';
import { Input } from "@/components/ui/input";

interface PostalDisplayProps {
  postnummer: string;
  poststed: string;
  errorPostnummer?: string;
  errorPoststed?: string;
}

const PostalDisplay: React.FC<PostalDisplayProps> = ({ 
  postnummer, 
  poststed, 
  errorPostnummer,
  errorPoststed 
}) => {
  return (
    <>
      <div>
        <label htmlFor="postnummer" className="block text-sm font-medium text-norsk-dark mb-1">
          PostNr.
        </label>
        <Input
          id="postnummer"
          name="postnummer"
          value={postnummer}
          className="w-full bg-gray-50"
          disabled={true}
          placeholder=""
        />
        {errorPostnummer && <p className="text-norsk-red text-sm mt-1">{errorPostnummer}</p>}
      </div>
      
      <div>
        <label htmlFor="poststed" className="block text-sm font-medium text-norsk-dark mb-1">
          Poststed
        </label>
        <Input
          id="poststed"
          name="poststed"
          value={poststed}
          className="w-full bg-gray-50"
          disabled={true}
          placeholder=""
        />
        {errorPoststed && <p className="text-norsk-red text-sm mt-1">{errorPoststed}</p>}
      </div>
    </>
  );
};

export default PostalDisplay;
