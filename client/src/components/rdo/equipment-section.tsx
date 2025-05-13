import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EquipmentItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

const equipmentItemSchema = z.object({
  name: z.string().min(1, { message: "Nome do equipamento é obrigatório" }),
  quantity: z.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  hours: z.number().min(0, { message: "Horas não pode ser negativo" }),
  notes: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentItemSchema>;

interface EquipmentSectionProps {
  onChange: (equipment: EquipmentItem[]) => void;
  initialData?: EquipmentItem[];
}

export function EquipmentSection({ onChange, initialData = [] }: EquipmentSectionProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentItemSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      hours: 8,
      notes: "",
    },
  });

  const handleAddOrUpdate = (data: EquipmentFormValues) => {
    let updatedEquipment: EquipmentItem[];

    if (editingId) {
      // Update existing item
      updatedEquipment = equipment.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      );
    } else {
      // Add new item
      updatedEquipment = [
        ...equipment,
        { ...data, id: uuidv4() }
      ];
    }

    setEquipment(updatedEquipment);
    onChange(updatedEquipment);
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (item: EquipmentItem) => {
    form.reset(item);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedEquipment = equipment.filter(item => item.id !== id);
    setEquipment(updatedEquipment);
    onChange(updatedEquipment);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Equipamentos</h3>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusIcon className="h-4 w-4" />
                Adicionar Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Equipamento" : "Adicionar Equipamento"}</DialogTitle>
                <DialogDescription>
                  Informe os detalhes do equipamento utilizado no dia.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Betoneira, Escavadeira, Andaime" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas de Uso</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Localização, condições de uso" {...field} />
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
        
        <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
          {equipment.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Equipamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horas de Uso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Observações</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.hours}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.notes || "-"}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-slate-500">
              Nenhum equipamento adicionado. Clique em "Adicionar Equipamento" para começar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
