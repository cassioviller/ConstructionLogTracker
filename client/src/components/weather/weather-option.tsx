import { cn } from "@/lib/utils";
import { CloudSun, CloudRain, Sun, Wind } from "lucide-react";

type WeatherType = "ensolarado" | "nublado" | "chuvoso" | "ventoso";

interface WeatherOptionProps {
  type: WeatherType;
  selected: boolean;
  onSelect: () => void;
  period?: string;
}

export function WeatherOption({ type, selected, onSelect, period }: WeatherOptionProps) {
  const getIcon = () => {
    switch (type) {
      case "ensolarado":
        return <Sun className="h-6 w-6 text-amber-500" />;
      case "nublado":
        return <CloudSun className="h-6 w-6 text-slate-400" />;
      case "chuvoso":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "ventoso":
        return <Wind className="h-6 w-6 text-slate-500" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "ensolarado":
        return "Ensolarado";
      case "nublado":
        return "Nublado";
      case "chuvoso":
        return "Chuvoso";
      case "ventoso":
        return "Ventoso";
    }
  };

  return (
    <div className="weather-option">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-colors w-full",
          selected 
            ? "border-primary-500 bg-primary-50" 
            : "border-slate-200 hover:bg-slate-50"
        )}
        aria-label={`${getLabel()} ${period || ""}`}
      >
        {getIcon()}
        <span className="mt-1 text-xs font-medium">{getLabel()}</span>
      </button>
    </div>
  );
}
