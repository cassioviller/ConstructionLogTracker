import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { WorkforceItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type WorkforceSectionProps = {
  workforce: WorkforceItem[];
  onWorkforceChange: (workforce: WorkforceItem[]) => void;
  disabled?: boolean;
};

const workforceItemSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Função é obrigatória"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  startTime: z.string().min(1, "Horário de entrada é obrigatório"),
  endTime: z.string().min(1, "Horário de saída é obrigatório"),
  notes: z.string().optional(),
});

type WorkforceItemFormValues = z.infer<typeof workforceItemSchema>;

export function WorkforceSection({ 
  workforce, 
  onWorkforceChange,
  disabled = false
}: WorkforceSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkforceItem | null>(null);

  const form = useForm<WorkforceItemFormValues>({
    resolver: zodResolver(workforceItemSchema),
    defaultValues: {
      role: "",
      quantity: 1,
      startTime: "07:00",
      endTime: "17:00",
      notes: "",
    },
  });

  const openNewDialog = () => {
    form.reset({
      role: "",
      quantity: 1,
      startTime: "07:00",
      endTime: "17:00",
      notes: "",
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: WorkforceItem) => {
    form.reset({
      id: item.id,
      role: item.role,
      quantity: item.quantity,
      startTime: item.startTime,
      endTime: item.endTime,
      notes: item.notes,
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onWorkforceChange(workforce.filter(item => item.id !== id));
  };

  const onSubmit = (data: WorkforceItemFormValues) => {
    if (editingItem) {
      // Update existing item
      onWorkforceChange(
        workforce.map(item => 
          item.id === editingItem.id ? { ...data, id: item.id } : item
        )
      );
    } else {
      // Add new item
      onWorkforceChange([
        ...workforce,
        { ...data, id: uuidv4() }
      ]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium leading-6 text-slate-900">Mão de Obra</h3>
        <Button 
          onClick={openNewDialog} 
          size="sm"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Função
        </Button>
      </div>

      {workforce.length > 0 ? (
        <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horário Entrada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horário Saída</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Observações</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {workforce.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm text-slate-900">{item.role}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.startTime}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.endTime}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.notes}</td>
                  <td className="px-4 py-4 text-sm text-right">
                    {!disabled && (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(item)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="text-slate-500 mb-4">Nenhuma função de mão de obra adicionada ainda.</p>
          <Button onClick={openNewDialog} disabled={disabled}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Função
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Função" : "Adicionar Função"}
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Engenheiro, Pedreiro, Servente..." 
                        {...field} 
                      />
                    </FormControl>
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
                        min="1" 
                        {...field}
                      />
                    </FormControl>
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
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Nomes, locais de trabalho... (opcional)" 
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
