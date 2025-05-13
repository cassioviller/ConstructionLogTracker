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
import { Edit, Trash2, Plus } from "lucide-react";
import { insertWorkforceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Schema with local validations
const workforceFormSchema = z.object({
  funcao: z.string().min(1, "Função é obrigatória"),
  quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  horarioEntrada: z.string().optional(),
  horarioSaida: z.string().optional(),
  observacoes: z.string().optional(),
});

type WorkforceFormValues = z.infer<typeof workforceFormSchema>;

type Workforce = {
  id?: number;
  rdoId?: number;
  funcao: string;
  quantidade: number;
  horarioEntrada?: string;
  horarioSaida?: string;
  observacoes?: string;
};

interface RdoWorkforceTableProps {
  rdoId?: number;
  workforce: Workforce[];
  onAddWorkforce: (workforce: Workforce) => void;
  onUpdateWorkforce: (id: number, workforce: Workforce) => void;
  onRemoveWorkforce: (id: number) => void;
}

export function RdoWorkforceTable({
  rdoId,
  workforce,
  onAddWorkforce,
  onUpdateWorkforce,
  onRemoveWorkforce
}: RdoWorkforceTableProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const form = useForm<WorkforceFormValues>({
    resolver: zodResolver(workforceFormSchema),
    defaultValues: {
      funcao: "",
      quantidade: 1,
      horarioEntrada: "",
      horarioSaida: "",
      observacoes: "",
    },
  });
  
  const handleEdit = (item: Workforce) => {
    if (item.id) {
      setEditingId(item.id);
      form.reset({
        funcao: item.funcao,
        quantidade: item.quantidade,
        horarioEntrada: item.horarioEntrada || "",
        horarioSaida: item.horarioSaida || "",
        observacoes: item.observacoes || "",
      });
      setOpenDialog(true);
    }
  };
  
  const onSubmit = (data: WorkforceFormValues) => {
    if (editingId !== null) {
      onUpdateWorkforce(editingId, { ...data, id: editingId });
    } else {
      onAddWorkforce(data);
    }
    setOpenDialog(false);
    form.reset();
    setEditingId(null);
  };
  
  const openNewWorkforceDialog = () => {
    form.reset({
      funcao: "",
      quantidade: 1,
      horarioEntrada: "",
      horarioSaida: "",
      observacoes: "",
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Mão de Obra</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openNewWorkforceDialog}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Função</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Horário Entrada</TableHead>
              <TableHead>Horário Saída</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workforce.length > 0 ? (
              workforce.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.funcao}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.horarioEntrada || "-"}</TableCell>
                  <TableCell>{item.horarioSaida || "-"}</TableCell>
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
                        onClick={() => item.id && onRemoveWorkforce(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                  Nenhuma mão de obra registrada. Clique em "Adicionar" para registrar.
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
              {editingId ? "Editar Mão de Obra" : "Adicionar Mão de Obra"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="funcao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pedreiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="horarioEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Entrada</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 07:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horarioSaida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Saída</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 17:00" {...field} />
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
