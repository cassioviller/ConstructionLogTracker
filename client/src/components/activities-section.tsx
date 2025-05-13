import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

// Activity schema
const activitySchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Descrição da atividade é obrigatória"),
  completionPercentage: z.number().min(0).max(100, "Percentual deve estar entre 0 e 100"),
  status: z.string().min(1, "Status é obrigatório"),
});

type Activity = z.infer<typeof activitySchema>;

interface ActivitiesSectionProps {
  activities: Activity[];
  onChange: (activities: Activity[]) => void;
}

const ActivitiesSection = ({ activities, onChange }: ActivitiesSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "Em andamento";
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleOpenDialog = (activity?: Activity) => {
    if (activity) {
      setCurrentActivity(activity);
    } else {
      setCurrentActivity({
        id: crypto.randomUUID(),
        description: "",
        completionPercentage: 0,
        status: "in_progress",
      });
    }
    setDialogOpen(true);
    setErrors({});
  };

  const validateActivity = (activity: Activity): boolean => {
    try {
      activitySchema.parse(activity);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSaveActivity = () => {
    if (currentActivity && validateActivity(currentActivity)) {
      if (activities.find((a) => a.id === currentActivity.id)) {
        onChange(
          activities.map((a) =>
            a.id === currentActivity.id ? currentActivity : a
          )
        );
      } else {
        onChange([...activities, currentActivity]);
      }
      setDialogOpen(false);
    }
  };

  const handleDeleteActivity = (idToDelete: string | undefined) => {
    if (idToDelete) {
      onChange(activities.filter((a) => a.id !== idToDelete));
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-slate-900">{activity.description}</h4>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {getStatusLabel(activity.status)} - {activity.completionPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="w-full mr-2">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${activity.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <Button 
                    onClick={() => handleOpenDialog(activity)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button 
                    onClick={() => handleDeleteActivity(activity.id)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-slate-500">
              Nenhuma atividade adicionada. Clique no botão abaixo para adicionar.
            </p>
          </div>
        )}

        <Button 
          onClick={() => handleOpenDialog()} 
          variant="outline" 
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Atividade
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentActivity?.id && activities.find(a => a.id === currentActivity.id) 
                ? "Editar Atividade" 
                : "Adicionar Atividade"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição da Atividade*</Label>
              <Textarea
                id="description"
                value={currentActivity?.description || ""}
                onChange={(e) => 
                  currentActivity && setCurrentActivity({
                    ...currentActivity, 
                    description: e.target.value
                  })
                }
                placeholder="Descreva a atividade realizada..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={currentActivity?.status || "in_progress"}
                  onValueChange={(value) => 
                    currentActivity && setCurrentActivity({
                      ...currentActivity, 
                      status: value
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="completionPercentage">Percentual de Conclusão*</Label>
                <div className="flex items-center">
                  <Input
                    id="completionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={currentActivity?.completionPercentage || 0}
                    onChange={(e) => 
                      currentActivity && setCurrentActivity({
                        ...currentActivity, 
                        completionPercentage: parseInt(e.target.value) || 0
                      })
                    }
                  />
                  <span className="ml-2">%</span>
                </div>
                {errors.completionPercentage && (
                  <p className="text-sm text-red-500">{errors.completionPercentage}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveActivity}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivitiesSection;
