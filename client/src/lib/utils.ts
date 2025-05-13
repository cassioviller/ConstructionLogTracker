import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to PT-BR format
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format time to PT-BR format
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return "U";
  
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Get weather status in Portuguese
export function getWeatherStatusText(status: string): string {
  switch (status) {
    case "sunny": return "Ensolarado";
    case "cloudy": return "Nublado";
    case "rainy": return "Chuvoso";
    case "windy": return "Ventoso";
    case "clear": return "Limpo";
    default: return status;
  }
}
