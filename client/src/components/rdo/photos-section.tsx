import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ImagePlus, Maximize } from "lucide-react";
import { UploadArea } from "@/components/ui/upload-area";
import { PhotoItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotosSectionProps {
  onChange: (photos: PhotoItem[]) => void;
  initialData?: PhotoItem[];
}

export function PhotosSection({ onChange, initialData = [] }: PhotosSectionProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialData);
  const [previewImage, setPreviewImage] = useState<PhotoItem | null>(null);

  // In a real application, this would upload the file to a server
  // For now, we'll create a data URL for demonstration
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: PhotoItem[] = [];

    Array.from(files).forEach(file => {
      // Only process image files
      if (!file.type.match('image.*')) return;

      // Create a FileReader to read the file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const newPhoto: PhotoItem = {
          id: uuidv4(),
          url: dataUrl,
          caption: file.name
        };

        newPhotos.push(newPhoto);
        
        // Update state if this is the last file
        if (newPhotos.length === files.length) {
          const updatedPhotos = [...photos, ...newPhotos];
          setPhotos(updatedPhotos);
          onChange(updatedPhotos);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const updatedPhotos = photos.map(photo => 
      photo.id === id ? { ...photo, caption } : photo
    );
    setPhotos(updatedPhotos);
    onChange(updatedPhotos);
  };

  const handleDeletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    onChange(updatedPhotos);
  };

  const handleOpenPreview = (photo: PhotoItem) => {
    setPreviewImage(photo);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Registro Fotográfico</h3>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <UploadArea onFileUpload={handleFileUpload} multiple accept="image/*" />
          
          {photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group bg-white rounded-md overflow-hidden border border-slate-200">
                  <div className="relative h-48">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Foto da obra"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80" onClick={() => handleOpenPreview(photo)}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="icon" className="h-8 w-8 bg-white/80" onClick={() => handleDeletePhoto(photo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <Input
                      value={photo.caption || ""}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      placeholder="Legenda da foto"
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image preview dialog */}
        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
            <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
              <DialogTitle className="text-white">{previewImage?.caption || "Foto da obra"}</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="flex items-center justify-center h-[80vh]">
                <img 
                  src={previewImage.url} 
                  alt={previewImage.caption || "Foto da obra"} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
