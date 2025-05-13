import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Plus, Trash2, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Photo = {
  id: string;
  file: File;
  preview: string;
  caption: string;
};

type PhotoUploadSectionProps = {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  disabled?: boolean;
};

export function PhotoUploadSection({ 
  photos, 
  onPhotosChange,
  disabled = false
}: PhotoUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newPhotos: Photo[] = Array.from(e.target.files).map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));
    
    onPhotosChange([...photos, ...newPhotos]);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onPhotosChange(
      photos.map(photo => 
        photo.id === id ? { ...photo, caption } : photo
      )
    );
  };

  const handleDelete = (id: string) => {
    // Release object URL before removing
    const photoToRemove = photos.find(p => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    
    onPhotosChange(photos.filter(photo => photo.id !== id));
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const newPhotos: Photo[] = Array.from(e.dataTransfer.files)
      .filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .map(file => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        caption: "",
      }));
    
    onPhotosChange([...photos, ...newPhotos]);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-slate-900 mb-3">Registro Fotográfico</h3>

      <div 
        className="bg-slate-50 p-4 rounded-lg"
        onDragOver={handleDragOver}
        onDrop={!disabled ? handleDrop : undefined}
      >
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <Image className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">Arraste e solte fotos ou vídeos aqui</p>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
          <Button
            onClick={openFileDialog}
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivos
          </Button>
        </div>
        
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative bg-white rounded-md overflow-hidden border border-slate-200">
                <img 
                  src={photo.preview} 
                  alt={photo.caption || "Imagem sem legenda"} 
                  className="h-24 w-full object-cover" 
                />
                {!disabled && (
                  <div className="absolute top-1 right-1">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="p-2">
                  <Input 
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    placeholder="Legenda" 
                    className="w-full text-xs"
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}
            
            {!disabled && (
              <div 
                className="flex items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:bg-slate-100"
                onClick={openFileDialog}
              >
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
