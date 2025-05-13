import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Image, Plus, X } from "lucide-react";

type Photo = {
  id?: number;
  rdoId?: number;
  file?: File;
  url: string;
  titulo?: string;
};

interface RdoPhotoUploadProps {
  rdoId?: number;
  photos: Photo[];
  onAddPhotos: (photos: Photo[]) => void;
  onUpdatePhotoTitle: (id: number, title: string) => void;
  onRemovePhoto: (id: number) => void;
}

export function RdoPhotoUpload({
  rdoId,
  photos,
  onAddPhotos,
  onUpdatePhotoTitle,
  onRemovePhoto
}: RdoPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newPhotos: Photo[] = [];
    
    Array.from(files).forEach((file) => {
      // Create a local URL for preview
      const photoUrl = URL.createObjectURL(file);
      
      newPhotos.push({
        file,
        url: photoUrl,
        titulo: file.name,
      });
    });
    
    onAddPhotos(newPhotos);
    
    // Reset the input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleTitleChange = (id: number | undefined, title: string) => {
    if (id) {
      onUpdatePhotoTitle(id, title);
    }
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Registro Fotográfico</h3>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFilesSelected}
          />
          <Image className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">Arraste e solte fotos ou vídeos aqui</p>
          <Button variant="default" onClick={openFileSelector}>
            Selecionar Arquivos
          </Button>
        </div>
        
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={photo.id || `new-${index}`} className="relative bg-white rounded-md overflow-hidden border border-slate-200">
                <img 
                  src={photo.url} 
                  alt={photo.titulo || `Foto ${index + 1}`} 
                  className="h-24 w-full object-cover" 
                />
                <div className="absolute top-1 right-1">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-6 w-6 rounded-full"
                    onClick={() => photo.id && onRemovePhoto(photo.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  <Input 
                    type="text" 
                    value={photo.titulo || ""} 
                    onChange={(e) => handleTitleChange(photo.id, e.target.value)}
                    placeholder="Legenda" 
                    className="text-xs border-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
