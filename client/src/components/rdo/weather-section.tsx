import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import WeatherOption from "@/components/ui/weather-option";

type WeatherSectionProps = {
  onChange: (data: any) => void;
  initialData?: any;
};

export function WeatherSection({ onChange, initialData }: WeatherSectionProps) {
  const [weatherData, setWeatherData] = useState({
    weatherMorning: initialData?.weatherMorning || "sunny",
    weatherAfternoon: initialData?.weatherAfternoon || "cloudy",
    weatherNight: initialData?.weatherNight || "rainy",
    weatherNotes: initialData?.weatherNotes || "",
  });

  const handleWeatherChange = (period: string, value: string) => {
    const updatedData = {
      ...weatherData,
      [period]: value,
    };
    setWeatherData(updatedData);
    onChange(updatedData);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedData = {
      ...weatherData,
      weatherNotes: e.target.value,
    };
    setWeatherData(updatedData);
    onChange(updatedData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Condições Climáticas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Morning */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Manhã</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <WeatherOption
                id="morning-sunny"
                name="weatherMorning"
                type="sunny"
                label="Ensolarado"
                checked={weatherData.weatherMorning === "sunny"}
                onChange={() => handleWeatherChange("weatherMorning", "sunny")}
              />
              
              <WeatherOption
                id="morning-cloudy"
                name="weatherMorning"
                type="cloudy"
                label="Nublado"
                checked={weatherData.weatherMorning === "cloudy"}
                onChange={() => handleWeatherChange("weatherMorning", "cloudy")}
              />
              
              <WeatherOption
                id="morning-rainy"
                name="weatherMorning"
                type="rainy"
                label="Chuvoso"
                checked={weatherData.weatherMorning === "rainy"}
                onChange={() => handleWeatherChange("weatherMorning", "rainy")}
              />
              
              <WeatherOption
                id="morning-windy"
                name="weatherMorning"
                type="windy"
                label="Ventoso"
                checked={weatherData.weatherMorning === "windy"}
                onChange={() => handleWeatherChange("weatherMorning", "windy")}
              />
            </div>
          </div>
          
          {/* Afternoon */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tarde</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <WeatherOption
                id="afternoon-sunny"
                name="weatherAfternoon"
                type="sunny"
                label="Ensolarado"
                checked={weatherData.weatherAfternoon === "sunny"}
                onChange={() => handleWeatherChange("weatherAfternoon", "sunny")}
              />
              
              <WeatherOption
                id="afternoon-cloudy"
                name="weatherAfternoon"
                type="cloudy"
                label="Nublado"
                checked={weatherData.weatherAfternoon === "cloudy"}
                onChange={() => handleWeatherChange("weatherAfternoon", "cloudy")}
              />
              
              <WeatherOption
                id="afternoon-rainy"
                name="weatherAfternoon"
                type="rainy"
                label="Chuvoso"
                checked={weatherData.weatherAfternoon === "rainy"}
                onChange={() => handleWeatherChange("weatherAfternoon", "rainy")}
              />
              
              <WeatherOption
                id="afternoon-windy"
                name="weatherAfternoon"
                type="windy"
                label="Ventoso"
                checked={weatherData.weatherAfternoon === "windy"}
                onChange={() => handleWeatherChange("weatherAfternoon", "windy")}
              />
            </div>
          </div>
          
          {/* Night */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Noite</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <WeatherOption
                id="night-clear"
                name="weatherNight"
                type="clear"
                label="Limpo"
                checked={weatherData.weatherNight === "clear"}
                onChange={() => handleWeatherChange("weatherNight", "clear")}
              />
              
              <WeatherOption
                id="night-cloudy"
                name="weatherNight"
                type="cloudy"
                label="Nublado"
                checked={weatherData.weatherNight === "cloudy"}
                onChange={() => handleWeatherChange("weatherNight", "cloudy")}
              />
              
              <WeatherOption
                id="night-rainy"
                name="weatherNight"
                type="rainy"
                label="Chuvoso"
                checked={weatherData.weatherNight === "rainy"}
                onChange={() => handleWeatherChange("weatherNight", "rainy")}
              />
              
              <WeatherOption
                id="night-windy"
                name="weatherNight"
                type="windy"
                label="Ventoso"
                checked={weatherData.weatherNight === "windy"}
                onChange={() => handleWeatherChange("weatherNight", "windy")}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="obs-clima" className="block text-sm font-medium text-slate-700 mb-1">
            Observações Climáticas
          </label>
          <Textarea
            id="obs-clima"
            placeholder="Descreva condições climáticas relevantes..."
            rows={2}
            value={weatherData.weatherNotes}
            onChange={handleNotesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
