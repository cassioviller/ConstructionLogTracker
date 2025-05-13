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
import { EquipmentItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type EquipmentSectionProps = {
  equipment: EquipmentItem[];
  onEquipmentChange: (equipment: EquipmentItem[]) => void;
  disabled?: boolean;
};

const equipmentItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome do equipamento é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  hours: z.coerce.number().min(0, "Horas não pode ser negativo"),
  notes: z.string().optional(),
});

type EquipmentItemFormValues = z.infer<typeof equipmentItemSchema>;

export function EquipmentSection({ 
  equipment, 
  onEquipmentChange,
  disabled = false
}: EquipmentSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  const form = useForm<EquipmentItemFormValues>({
    resolver: zodResolver(equipmentItemSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      hours: 8,
      notes: "",
    },
  });

  const openNewDialog = () => {
    form.reset({
      name: "",
      quantity: 1,
      hours: 8,
      notes: "",
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: EquipmentItem) => {
    form.reset({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      hours: item.hours,
      notes: item.notes,
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onEquipmentChange(equipment.filter(item => item.id !== id));
  };

  const onSubmit = (data: EquipmentItemFormValues) => {
    if (editingItem) {
      // Update existing item
      onEquipmentChange(
        equipment.map(item => 
          item.id === editingItem.id ? { ...data, id: item.id } : item
        )
      );
    } else {
      // Add new item
      onEquipmentChange([
        ...equipment,
        { ...data, id: uuidv4() }
      ]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium leading-6 text-slate-900">Equipamentos</h3>
        <Button 
          onClick={openNewDialog} 
          size="sm"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Equipamento
        </Button>
      </div>

      {equipment.length > 0 ? (
        <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
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
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm text-slate-900">{item.name}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.hours}h</td>
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
          <p className="text-slate-500 mb-4">Nenhum equipamento adicionado ainda.</p>
          <Button onClick={openNewDialog} disabled={disabled}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Equipamento
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Equipamento" : "Adicionar Equipamento"}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Betoneira, Escavadeira, Andaime..." 
                        {...field} 
                      />
                    </FormControl>
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
                          min="1" 
                          {...field}
                        />
                      </FormControl>
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
                          min="0" 
                          step="0.5"
                          {...field}
                        />
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
                        placeholder="Ex: Local de uso, finalidade... (opcional)" 
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
