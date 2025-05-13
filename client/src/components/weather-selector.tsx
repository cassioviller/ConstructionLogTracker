import { useState } from "react";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Moon 
} from "lucide-react";

interface WeatherSelectorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

const WeatherSelector = ({ id, value, onChange }: WeatherSelectorProps) => {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  // Define weather options
  const weatherOptions = [
    {
      value: "ensolarado",
      label: "Ensolarado",
      icon: <Sun className="h-6 w-6 text-amber-500" />,
    },
    {
      value: "nublado",
      label: "Nublado",
      icon: <Cloud className="h-6 w-6 text-slate-400" />,
    },
    {
      value: "chuvoso",
      label: "Chuvoso",
      icon: <CloudRain className="h-6 w-6 text-blue-500" />,
    },
    {
      value: "ventoso",
      label: "Ventoso",
      icon: <Wind className="h-6 w-6 text-slate-500" />,
    },
  ];

  // Special case for "night" ID - include "limpo" option instead of "ensolarado"
  if (id === "night") {
    weatherOptions[0] = {
      value: "limpo",
      label: "Limpo",
      icon: <Moon className="h-6 w-6 text-slate-800" />,
    };
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {weatherOptions.map((option) => (
        <div className="relative" key={`${id}-${option.value}`}>
          <input
            type="radio"
            id={`${id}-${option.value}`}
            name={`weather-${id}`}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => handleChange(option.value)}
            className="peer hidden"
          />
          <label
            htmlFor={`${id}-${option.value}`}
            className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary-50 hover:bg-slate-50 transition-colors"
          >
            {option.icon}
            <span className="mt-1 text-xs font-medium">{option.label}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default WeatherSelector;
