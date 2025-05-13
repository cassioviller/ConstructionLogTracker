import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, AlertCircle, Cloud, Calendar, Drill, User } from "lucide-react";

// Schema with local validations
const occurrenceFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  hora: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type OccurrenceFormValues = z.infer<typeof occurrenceFormSchema>;

type Occurrence = {
  id?: number;
  rdoId?: number;
  userId?: number;
  titulo: string;
  descricao: string;
  hora?: string;
  tags?: string[];
};

interface RdoOccurrencesSectionProps {
  rdoId?: number;
  occurrences: Occurrence[];
  onAddOccurrence: (occurrence: Occurrence) => void;
  onUpdateOccurrence: (id: number, occurrence: Occurrence) => void;
  onRemoveOccurrence: (id: number) => void;
}

export function RdoOccurrencesSection({
  rdoId,
  occurrences,
  onAddOccurrence,
  onUpdateOccurrence,
  onRemoveOccurrence,
}: RdoOccurrencesSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Available tags
  const availableTags = [
    { value: "clima", label: "Clima", icon: <Cloud className="h-3 w-3 mr-1" /> },
    { value: "material", label: "Material", icon: <Drill className="h-3 w-3 mr-1" /> },
    { value: "seguranca", label: "Segurança", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    { value: "mao_de_obra", label: "Mão de Obra", icon: <User className="h-3 w-3 mr-1" /> },
    { value: "cronograma", label: "Cronograma", icon: <Calendar className="h-3 w-3 mr-1" /> },
  ];
  
  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      hora: "",
      tags: [],
    },
  });
  
  const handleEdit = (occurrence: Occurrence) => {
    if (occurrence.id) {
      setEditingId(occurrence.id);
      setSelectedTags(occurrence.tags || []);
      form.reset({
        titulo: occurrence.titulo,
        descricao: occurrence.descricao,
        hora: occurrence.hora || "",
        tags: occurrence.tags,
      });
      setOpenDialog(true);
    }
  };
  
  const onSubmit = (data: OccurrenceFormValues) => {
    // Include selected tags
    const submissionData = {
      ...data,
      tags: selectedTags,
    };
    
    if (editingId !== null) {
      onUpdateOccurrence(editingId, { ...submissionData, id: editingId });
    } else {
      onAddOccurrence(submissionData);
    }
    setOpenDialog(false);
    setSelectedTags([]);
    form.reset();
    setEditingId(null);
  };
  
  const openNewOccurrenceDialog = () => {
    form.reset({
      titulo: "",
      descricao: "",
      hora: "",
      tags: [],
    });
    setSelectedTags([]);
    setEditingId(null);
    setOpenDialog(true);
  };
  
  const toggleTag = (tagValue: string) => {
    setSelectedTags(current => 
      current.includes(tagValue) 
        ? current.filter(tag => tag !== tagValue) 
        : [...current, tagValue]
    );
  };
  
  const getTagIcon = (tagValue: string) => {
    const tag = availableTags.find(t => t.value === tagValue);
    return tag?.icon || null;
  };
  
  const getTagLabel = (tagValue: string) => {
    const tag = availableTags.find(t => t.value === tagValue);
    return tag?.label || tagValue;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Ocorrências / Eventos</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openNewOccurrenceDialog}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
        {occurrences.length > 0 ? (
          occurrences.map((occurrence) => (
            <Card key={occurrence.id} className="p-3 border border-slate-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-slate-800">{occurrence.titulo}</h4>
                    <div className="flex space-x-1">
                      {occurrence.tags && occurrence.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="flex items-center text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {getTagIcon(tag)}
                          {getTagLabel(tag)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{occurrence.descricao}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      {occurrence.hora ? `${occurrence.hora} | ` : ""} 
                      Usuário
                    </span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(occurrence)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => occurrence.id && onRemoveOccurrence(occurrence.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>Nenhuma ocorrência registrada. Clique em "Adicionar" para registrar eventos importantes.</p>
          </div>
        )}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Ocorrência" : "Adicionar Ocorrência"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atraso na entrega de material" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva a ocorrência em detalhes" 
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
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 10:30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.value}
                      variant="outline"
                      className={`cursor-pointer flex items-center ${
                        selectedTags.includes(tag.value)
                          ? "bg-primary-100 text-primary-800 border-primary-300"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                      onClick={() => toggleTag(tag.value)}
                    >
                      {tag.icon}
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
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
