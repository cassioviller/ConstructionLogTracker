import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";

// Schema with local validations
const activityFormSchema = z.object({
  descricao: z.string().min(1, "Descrição da atividade é obrigatória"),
  percentual: z.number().min(0, "Percentual mínimo é 0").max(100, "Percentual máximo é 100"),
  status: z.string(),
  observacoes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

type Activity = {
  id?: number;
  rdoId?: number;
  descricao: string;
  percentual: number;
  status: string;
  observacoes?: string;
};

interface RdoActivitiesSectionProps {
  rdoId?: number;
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onUpdateActivity: (id: number, activity: Activity) => void;
  onRemoveActivity: (id: number) => void;
}

export function RdoActivitiesSection({
  rdoId,
  activities,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity
}: RdoActivitiesSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      descricao: "",
      percentual: 0,
      status: "em_andamento",
      observacoes: "",
    },
  });
  
  const handleEdit = (activity: Activity) => {
    if (activity.id) {
      setEditingId(activity.id);
      form.reset({
        descricao: activity.descricao,
        percentual: activity.percentual,
        status: activity.status,
        observacoes: activity.observacoes || "",
      });
      setOpenDialog(true);
    }
  };
  
  const onSubmit = (data: ActivityFormValues) => {
    if (editingId !== null) {
      onUpdateActivity(editingId, { ...data, id: editingId });
    } else {
      onAddActivity(data);
    }
    setOpenDialog(false);
    form.reset();
    setEditingId(null);
  };
  
  const openNewActivityDialog = () => {
    form.reset({
      descricao: "",
      percentual: 0,
      status: "em_andamento",
      observacoes: "",
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "Em andamento";
      case "concluido":
        return "Concluído";
      case "pendente":
        return "Pendente";
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Atividades Executadas</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openNewActivityDialog}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="flex mb-4">
          <Textarea 
            placeholder="Descrição geral das atividades executadas no dia (opcional)"
            className="w-full"
            rows={3}
          />
        </div>
        
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Card key={activity.id} className="p-3 border border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-slate-800">{activity.descricao}</h4>
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 mr-2">Conclusão:</span>
                        <span className="text-xs font-medium">{activity.percentual}%</span>
                      </div>
                    </div>
                    {activity.observacoes && (
                      <p className="text-xs text-slate-500 mt-1">{activity.observacoes}</p>
                    )}
                    <div className="mt-2 flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}>
                        {getStatusLabel(activity.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex ml-4 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(activity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => activity.id && onRemoveActivity(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p>Nenhuma atividade registrada. Clique em "Adicionar" para registrar.</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Atividade" : "Adicionar Atividade"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Atividade</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a atividade executada"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="percentual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual de Conclusão</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value}
                          />
                          <span>%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="em_andamento">Em andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input placeholder="Observações adicionais" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
