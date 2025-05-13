import { Cloud, Sun, Umbrella, Wind, Moon } from "lucide-react";

interface WeatherOptionProps {
  id: string;
  name: string;
  type: "sunny" | "cloudy" | "rainy" | "windy" | "clear" | string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function WeatherOption({ id, name, type, label, checked, onChange }: WeatherOptionProps) {
  const getWeatherIcon = () => {
    switch (type) {
      case "sunny":
        return <Sun className="h-6 w-6 text-amber-500" />;
      case "cloudy":
        return <Cloud className="h-6 w-6 text-slate-400" />;
      case "rainy":
        return <Umbrella className="h-6 w-6 text-blue-500" />;
      case "windy":
        return <Wind className="h-6 w-6 text-slate-500" />;
      case "clear":
        return <Moon className="h-6 w-6 text-slate-800" />;
      default:
        return <Sun className="h-6 w-6 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <input 
        type="radio" 
        id={id} 
        name={name} 
        className="peer hidden" 
        checked={checked} 
        onChange={onChange}
      />
      <label 
        htmlFor={id} 
        className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-md cursor-pointer peer-checked:border-primary peer-checked:bg-primary-50 hover:bg-slate-50 transition-colors"
      >
        {getWeatherIcon()}
        <span className="mt-1 text-xs font-medium">{label}</span>
      </label>
    </div>
  );
}
