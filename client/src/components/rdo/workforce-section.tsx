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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WorkforceItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

const workforceItemSchema = z.object({
  role: z.string().min(1, { message: "Função é obrigatória" }),
  quantity: z.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  startTime: z.string().min(1, { message: "Horário de entrada é obrigatório" }),
  endTime: z.string().min(1, { message: "Horário de saída é obrigatório" }),
  notes: z.string().optional(),
});

type WorkforceFormValues = z.infer<typeof workforceItemSchema>;

interface WorkforceSectionProps {
  onChange: (workforce: WorkforceItem[]) => void;
  initialData?: WorkforceItem[];
}

export function WorkforceSection({ onChange, initialData = [] }: WorkforceSectionProps) {
  const [workforce, setWorkforce] = useState<WorkforceItem[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<WorkforceFormValues>({
    resolver: zodResolver(workforceItemSchema),
    defaultValues: {
      role: "",
      quantity: 1,
      startTime: "07:00",
      endTime: "17:00",
      notes: "",
    },
  });

  const handleAddOrUpdate = (data: WorkforceFormValues) => {
    let updatedWorkforce: WorkforceItem[];

    if (editingId) {
      // Update existing item
      updatedWorkforce = workforce.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      );
    } else {
      // Add new item
      updatedWorkforce = [
        ...workforce,
        { ...data, id: uuidv4() }
      ];
    }

    setWorkforce(updatedWorkforce);
    onChange(updatedWorkforce);
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (item: WorkforceItem) => {
    form.reset(item);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedWorkforce = workforce.filter(item => item.id !== id);
    setWorkforce(updatedWorkforce);
    onChange(updatedWorkforce);
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
          <h3 className="text-lg font-medium leading-6 text-slate-900">Mão de Obra</h3>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusIcon className="h-4 w-4" />
                Adicionar Função
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Função" : "Adicionar Função"}</DialogTitle>
                <DialogDescription>
                  Informe os detalhes da mão de obra utilizada no dia.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Engenheiro, Pedreiro, Servente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Entrada</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Saída</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
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
                          <Input placeholder="Ex: Nomes, locais de trabalho" {...field} />
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
          {workforce.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Observações</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {workforce.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.role}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.startTime} - {item.endTime}</td>
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
              Nenhuma mão de obra adicionada. Clique em "Adicionar Função" para começar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
