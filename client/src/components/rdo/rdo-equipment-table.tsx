import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2, Plus } from "lucide-react";

// Schema with local validations
const equipmentFormSchema = z.object({
  equipamento: z.string().min(1, "Nome do equipamento é obrigatório"),
  quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  horasUso: z.number().optional(),
  observacoes: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

type Equipment = {
  id?: number;
  rdoId?: number;
  equipamento: string;
  quantidade: number;
  horasUso?: number;
  observacoes?: string;
};

interface RdoEquipmentTableProps {
  rdoId?: number;
  equipment: Equipment[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (id: number, equipment: Equipment) => void;
  onRemoveEquipment: (id: number) => void;
}

export function RdoEquipmentTable({
  rdoId,
  equipment,
  onAddEquipment,
  onUpdateEquipment,
  onRemoveEquipment
}: RdoEquipmentTableProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      equipamento: "",
      quantidade: 1,
      horasUso: undefined,
      observacoes: "",
    },
  });
  
  const handleEdit = (item: Equipment) => {
    if (item.id) {
      setEditingId(item.id);
      form.reset({
        equipamento: item.equipamento,
        quantidade: item.quantidade,
        horasUso: item.horasUso,
        observacoes: item.observacoes || "",
      });
      setOpenDialog(true);
    }
  };
  
  const onSubmit = (data: EquipmentFormValues) => {
    if (editingId !== null) {
      onUpdateEquipment(editingId, { ...data, id: editingId });
    } else {
      onAddEquipment(data);
    }
    setOpenDialog(false);
    form.reset();
    setEditingId(null);
  };
  
  const openNewEquipmentDialog = () => {
    form.reset({
      equipamento: "",
      quantidade: 1,
      horasUso: undefined,
      observacoes: "",
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Equipamentos</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openNewEquipmentDialog}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Horas de Uso</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.length > 0 ? (
              equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.equipamento}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.horasUso || "-"}</TableCell>
                  <TableCell>{item.observacoes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => item.id && onRemoveEquipment(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                  Nenhum equipamento registrado. Clique em "Adicionar" para registrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Equipamento" : "Adicionar Equipamento"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="equipamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Betoneira" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horasUso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas de Uso</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 8" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
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
