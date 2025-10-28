import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Share2, Archive, Camera } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  specialty: string;
  avatarUrl?: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ name, specialty, avatarUrl, isEditing, setIsEditing, onAvatarChange }: ProfileHeaderProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-card shadow-sm rounded-lg mb-6 md:flex-row md:justify-between md:items-start">
      <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4">
        <div className="relative h-24 w-24 mb-4 md:mb-0" onClick={handleAvatarClick}>
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer transition-opacity duration-300 opacity-0 hover:opacity-100"
            >
              <Camera className="h-8 w-8 text-white" />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAvatarChange}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-muted-foreground">{specialty}</p>
        </div>
      </div>
      <div className="flex space-x-2 mt-4 md:mt-0">
        {!isEditing && (
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" /> Compartilhar
            </Button>
            <Button variant="destructive" size="sm">
              <Archive className="h-4 w-4 mr-2" /> Arquivar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};