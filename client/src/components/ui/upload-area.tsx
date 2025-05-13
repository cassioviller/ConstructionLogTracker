import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface UploadAreaProps {
  onFileUpload: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

export function UploadArea({ 
  onFileUpload, 
  multiple = false, 
  accept = "image/*",
  maxSize = 10 // Default 10MB
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFiles = (files: FileList | null): boolean => {
    if (!files || files.length === 0) return false;

    // Check file size
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > maxSize) {
        setError(`Arquivo ${file.name} excede o tamanho máximo de ${maxSize}MB`);
        return false;
      }
      
      // Check file type if accept is specified
      if (accept && accept !== "*") {
        const acceptTypes = accept.split(",").map(type => type.trim());
        const fileType = file.type;
        
        // Check if the file type matches any of the accepted types
        const isAccepted = acceptTypes.some(type => {
          if (type.endsWith("/*")) {
            // Handle wildcards like "image/*"
            const mainType = type.split("/")[0];
            return fileType.startsWith(`${mainType}/`);
          }
          return type === fileType;
        });
        
        if (!isAccepted) {
          setError(`Tipo de arquivo não suportado: ${file.name}`);
          return false;
        }
      }
    }
    
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (validateFiles(files)) {
      onFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (validateFiles(files)) {
      onFileUpload(files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-slate-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
      
      <p className="text-slate-500 mb-3">
        {isDragging ? (
          <span className="font-medium text-primary">Solte os arquivos aqui</span>
        ) : (
          <span>Arraste e solte fotos ou vídeos aqui</span>
        )}
      </p>
      
      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}
      
      <div className="relative z-0">
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Button type="button" onClick={handleButtonClick}>
          Selecionar Arquivos
        </Button>
      </div>
      
      <p className="mt-2 text-xs text-slate-500">
        Tamanho máximo: {maxSize}MB {accept !== "*" && `• Formatos: ${accept}`}
      </p>
    </div>
  );
}
