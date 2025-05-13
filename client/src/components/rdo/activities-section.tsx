import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActivityItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

const activityItemSchema = z.object({
  description: z.string().min(1, { message: "Descrição da atividade é obrigatória" }),
  completion: z.number().min(0, { message: "Conclusão não pode ser negativa" }).max(100, { message: "Conclusão máxima é 100%" }),
  notes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityItemSchema>;

interface ActivitiesSectionProps {
  onChange: (activities: ActivityItem[]) => void;
  initialData?: ActivityItem[];
}

export function ActivitiesSection({ onChange, initialData = [] }: ActivitiesSectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityItemSchema),
    defaultValues: {
      description: "",
      completion: 0,
      notes: "",
    },
  });

  const handleAddOrUpdate = (data: ActivityFormValues) => {
    let updatedActivities: ActivityItem[];

    if (editingId) {
      // Update existing item
      updatedActivities = activities.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      );
    } else {
      // Add new item
      updatedActivities = [
        ...activities,
        { ...data, id: uuidv4() }
      ];
    }

    setActivities(updatedActivities);
    onChange(updatedActivities);
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (item: ActivityItem) => {
    form.reset(item);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedActivities = activities.filter(item => item.id !== id);
    setActivities(updatedActivities);
    onChange(updatedActivities);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset();
    }
  };

  const getCompletionStatusClass = (completion: number) => {
    if (completion === 100) return "bg-green-100 text-green-800";
    if (completion >= 75) return "bg-emerald-100 text-emerald-800";
    if (completion >= 50) return "bg-yellow-100 text-yellow-800";
    if (completion >= 25) return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-800";
  };

  const getCompletionStatusText = (completion: number) => {
    if (completion === 100) return "Concluído";
    if (completion >= 75) return "Em finalização";
    if (completion >= 50) return "Avançado";
    if (completion >= 25) return "Em andamento";
    if (completion > 0) return "Iniciado";
    return "Não iniciado";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Atividades Executadas</h3>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusIcon className="h-4 w-4" />
                Adicionar Atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Atividade" : "Adicionar Atividade"}</DialogTitle>
                <DialogDescription>
                  Informe os detalhes da atividade executada no dia.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Atividade</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Concretagem da laje do segundo pavimento..." 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="completion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentual de Conclusão</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o percentual de conclusão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0% - Não iniciado</SelectItem>
                            <SelectItem value="25">25% - Iniciado</SelectItem>
                            <SelectItem value="50">50% - Metade concluído</SelectItem>
                            <SelectItem value="75">75% - Avançado</SelectItem>
                            <SelectItem value="100">100% - Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Detalhes específicos ou desvios" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">{editingId ? "Atualizar" : "Adicionar"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-md border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-800">{item.description}</h4>
                      {item.notes && (
                        <p className="mt-1 text-xs text-slate-500">{item.notes}</p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompletionStatusClass(item.completion)}`}>
                        {getCompletionStatusText(item.completion)} - {item.completion}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="h-3.5 w-3.5 text-slate-500 mr-1" />
                      <span className="text-xs">Editar</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500 mr-1" />
                      <span className="text-xs">Excluir</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p className="mb-4">Nenhuma atividade adicionada</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                Adicionar Atividade
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
