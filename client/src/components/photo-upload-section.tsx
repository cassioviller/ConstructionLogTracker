import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, X } from "lucide-react";

interface PhotoItem {
  id?: string;
  file?: File;
  caption?: string;
  preview?: string;
}

interface PhotoUploadSectionProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

const PhotoUploadSection = ({ photos, onChange }: PhotoUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPhotos = newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        caption: "",
        preview: URL.createObjectURL(file),
      }));
      
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newPhotos = droppedFiles
        .filter(file => file.type.startsWith('image/'))
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          caption: "",
          preview: URL.createObjectURL(file),
        }));
      
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleDeletePhoto = (idToDelete: string | undefined) => {
    if (idToDelete) {
      // Revoke object URL to prevent memory leaks
      const photoToDelete = photos.find(p => p.id === idToDelete);
      if (photoToDelete?.preview) {
        URL.revokeObjectURL(photoToDelete.preview);
      }
      
      onChange(photos.filter((p) => p.id !== idToDelete));
    }
  };

  const handleCaptionChange = (id: string | undefined, caption: string) => {
    if (id) {
      onChange(
        photos.map((p) =>
          p.id === id ? { ...p, caption } : p
        )
      );
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary-50" : "border-slate-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Image className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-500 mb-3">
          Arraste e solte fotos ou vídeos aqui
        </p>
        <span className="relative z-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivos
          </Button>
        </span>
      </div>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group bg-white rounded-md overflow-hidden border border-slate-200">
              <div className="aspect-square relative">
                {photo.preview ? (
                  <img
                    src={photo.preview}
                    alt={photo.caption || "Imagem da obra"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-100">
                    <Image className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <Input
                  value={photo.caption || ""}
                  onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                  placeholder="Legenda"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;
