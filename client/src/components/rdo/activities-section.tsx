import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  Form
} from "@/components/ui/form";
import { v4 as uuidv4 } from "uuid";
import { ActivityItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type ActivitiesSectionProps = {
  activities: ActivityItem[];
  onActivitiesChange: (activities: ActivityItem[]) => void;
  disabled?: boolean;
};

const activityItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Descrição da atividade é obrigatória"),
  progress: z.coerce.number().min(0).max(100, "Progresso deve estar entre 0 e 100"),
  notes: z.string().optional(),
});

type ActivityItemFormValues = z.infer<typeof activityItemSchema>;

export function ActivitiesSection({ 
  activities, 
  onActivitiesChange,
  disabled = false
}: ActivitiesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);

  const form = useForm<ActivityItemFormValues>({
    resolver: zodResolver(activityItemSchema),
    defaultValues: {
      description: "",
      progress: 0,
      notes: "",
    },
  });

  const openNewDialog = () => {
    form.reset({
      description: "",
      progress: 0,
      notes: "",
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ActivityItem) => {
    form.reset({
      id: item.id,
      description: item.description,
      progress: item.progress,
      notes: item.notes,
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onActivitiesChange(activities.filter(item => item.id !== id));
  };

  const onSubmit = (data: ActivityItemFormValues) => {
    if (editingItem) {
      // Update existing item
      onActivitiesChange(
        activities.map(item => 
          item.id === editingItem.id ? { ...data, id: item.id } : item
        )
      );
    } else {
      // Add new item
      onActivitiesChange([
        ...activities,
        { ...data, id: uuidv4() }
      ]);
    }
    setIsDialogOpen(false);
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress === 100) return "bg-green-100 text-green-800";
    if (progress > 70) return "bg-lime-100 text-lime-800";
    if (progress > 40) return "bg-yellow-100 text-yellow-800";
    if (progress > 10) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium leading-6 text-slate-900">Atividades Executadas</h3>
        <Button 
          onClick={openNewDialog} 
          size="sm"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Atividade
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-slate-800">
                    {activity.description}
                  </h4>
                  {activity.notes && (
                    <p className="mt-1 text-sm text-slate-500">{activity.notes}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgressBadgeColor(activity.progress)}`}>
                    {activity.progress === 100 ? "Concluído" : "Em andamento"} - {activity.progress}%
                  </span>
                </div>
              </div>
              {!disabled && (
                <div className="mt-3 flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEditDialog(activity)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="text-slate-500 mb-4">Nenhuma atividade adicionada ainda.</p>
          <Button onClick={openNewDialog} disabled={disabled}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Atividade
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Atividade" : "Adicionar Atividade"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Atividade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Concretagem da laje do 3° pavimento" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progresso (%)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o progresso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0% - Não iniciado</SelectItem>
                          <SelectItem value="25">25% - Iniciado</SelectItem>
                          <SelectItem value="50">50% - Metade concluído</SelectItem>
                          <SelectItem value="75">75% - Bem avançado</SelectItem>
                          <SelectItem value="100">100% - Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes adicionais da atividade (opcional)" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
