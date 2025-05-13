import { WeatherType } from "@shared/schema";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Cloud, 
  CloudRain, 
  Moon, 
  Sun, 
  Wind 
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type WeatherSectionProps = {
  control: any;
  disabled?: boolean;
};

export function WeatherSection({ control, disabled = false }: WeatherSectionProps) {
  const weatherOptions: { value: WeatherType; label: string; icon: any }[] = [
    { value: "sunny", label: "Ensolarado", icon: Sun },
    { value: "cloudy", label: "Nublado", icon: Cloud },
    { value: "rainy", label: "Chuvoso", icon: CloudRain },
    { value: "windy", label: "Ventoso", icon: Wind },
    { value: "clear", label: "Limpo", icon: Moon },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-slate-900">Condições Climáticas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Morning Weather */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <FormField
            control={control}
            name="weatherMorning"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Manhã</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2"
                    disabled={disabled}
                  >
                    {weatherOptions.slice(0, 4).map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem
                          value={option.value}
                          id={`morning-${option.value}`}
                          className="peer sr-only"
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={`morning-${option.value}`}
                          className="flex flex-col items-center justify-center p-2 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-50"
                        >
                          <option.icon className={`h-6 w-6 ${option.value === "sunny" ? "text-amber-500" : option.value === "cloudy" ? "text-slate-400" : option.value === "rainy" ? "text-blue-500" : "text-slate-500"}`} />
                          <span className="mt-1 text-xs">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="weatherMorningNotes"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input 
                    placeholder="Observações (opcional)" 
                    {...field} 
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Afternoon Weather */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <FormField
            control={control}
            name="weatherAfternoon"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tarde</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2"
                    disabled={disabled}
                  >
                    {weatherOptions.slice(0, 4).map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem
                          value={option.value}
                          id={`afternoon-${option.value}`}
                          className="peer sr-only"
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={`afternoon-${option.value}`}
                          className="flex flex-col items-center justify-center p-2 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-50"
                        >
                          <option.icon className={`h-6 w-6 ${option.value === "sunny" ? "text-amber-500" : option.value === "cloudy" ? "text-slate-400" : option.value === "rainy" ? "text-blue-500" : "text-slate-500"}`} />
                          <span className="mt-1 text-xs">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="weatherAfternoonNotes"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input 
                    placeholder="Observações (opcional)" 
                    {...field} 
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Night Weather */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <FormField
            control={control}
            name="weatherNight"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Noite</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2"
                    disabled={disabled}
                  >
                    {weatherOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem
                          value={option.value}
                          id={`night-${option.value}`}
                          className="peer sr-only"
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={`night-${option.value}`}
                          className="flex flex-col items-center justify-center p-2 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-50"
                        >
                          <option.icon className={`h-6 w-6 ${option.value === "sunny" ? "text-amber-500" : option.value === "cloudy" ? "text-slate-400" : option.value === "rainy" ? "text-blue-500" : option.value === "clear" ? "text-slate-800" : "text-slate-500"}`} />
                          <span className="mt-1 text-xs">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="weatherNightNotes"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input 
                    placeholder="Observações (opcional)" 
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="weatherNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações Gerais</FormLabel>
            <FormControl>
              <Input 
                placeholder="Observações gerais sobre o clima (opcional)" 
                {...field}
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
