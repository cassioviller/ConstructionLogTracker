import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

// Equipment item schema
const equipmentItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome do equipamento é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
  hoursUsed: z.number().optional(),
  notes: z.string().optional(),
});

type EquipmentItem = z.infer<typeof equipmentItemSchema>;

interface EquipmentTableProps {
  equipment: EquipmentItem[];
  onChange: (equipment: EquipmentItem[]) => void;
}

const EquipmentTable = ({ equipment, onChange }: EquipmentTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<EquipmentItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common equipment in construction for suggestions
  const commonEquipment = [
    "Betoneira",
    "Escavadeira",
    "Retroescavadeira",
    "Caminhão Betoneira",
    "Andaime",
    "Grua",
    "Guindaste",
    "Compactador",
    "Martelete",
    "Vibrador de Concreto",
    "Furadeira",
    "Compressor de Ar",
    "Serra Circular",
    "Policorte",
    "Gerador",
    "Rompedor",
    "Plataforma Elevatória",
  ];

  const handleOpenDialog = (item?: EquipmentItem) => {
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem({
        id: crypto.randomUUID(),
        name: "",
        quantity: 1,
        hoursUsed: 8,
        notes: "",
      });
    }
    setDialogOpen(true);
    setErrors({});
  };

  const validateItem = (item: EquipmentItem): boolean => {
    try {
      equipmentItemSchema.parse(item);
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

  const handleSaveItem = () => {
    if (currentItem && validateItem(currentItem)) {
      if (equipment.find((item) => item.id === currentItem.id)) {
        onChange(
          equipment.map((item) =>
            item.id === currentItem.id ? currentItem : item
          )
        );
      } else {
        onChange([...equipment, currentItem]);
      }
      setDialogOpen(false);
    }
  };

  const handleDeleteItem = (idToDelete: string | undefined) => {
    if (idToDelete) {
      onChange(equipment.filter((item) => item.id !== idToDelete));
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => handleOpenDialog()} 
          variant="outline" 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Equipamento
        </Button>
      </div>

      {equipment.length > 0 ? (
        <div className="rounded-md border">
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
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.hoursUsed || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={() => handleOpenDialog(item)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button 
                        onClick={() => handleDeleteItem(item.id)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p className="text-slate-500">
            Nenhum equipamento adicionado. Clique no botão acima para adicionar.
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentItem?.id ? "Editar Equipamento" : "Adicionar Equipamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Equipamento*</Label>
              <input
                list="equipment-options"
                id="name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={currentItem?.name || ""}
                onChange={(e) => 
                  currentItem && setCurrentItem({...currentItem, name: e.target.value})
                }
                placeholder="Ex: Betoneira, Escavadeira, etc."
              />
              <datalist id="equipment-options">
                {commonEquipment.map((equip) => (
                  <option key={equip} value={equip} />
                ))}
              </datalist>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade*</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem?.quantity || 1}
                  onChange={(e) => 
                    currentItem && setCurrentItem({
                      ...currentItem, 
                      quantity: parseInt(e.target.value) || 1
                    })
                  }
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hoursUsed">Horas de Uso</Label>
                <Input
                  id="hoursUsed"
                  type="number"
                  min="0"
                  value={currentItem?.hoursUsed || ""}
                  onChange={(e) => 
                    currentItem && setCurrentItem({
                      ...currentItem, 
                      hoursUsed: e.target.value !== "" ? parseInt(e.target.value) : undefined
                    })
                  }
                  placeholder="Ex: 8"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={currentItem?.notes || ""}
                onChange={(e) => 
                  currentItem && setCurrentItem({
                    ...currentItem, 
                    notes: e.target.value
                  })
                }
                placeholder="Local de uso, detalhes de operação, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentTable;
