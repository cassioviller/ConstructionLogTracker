import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { OccurrenceItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type OccurrencesSectionProps = {
  occurrences: OccurrenceItem[];
  onOccurrencesChange: (occurrences: OccurrenceItem[]) => void;
  disabled?: boolean;
};

const occurrenceItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título da ocorrência é obrigatório"),
  description: z.string().min(1, "Descrição da ocorrência é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  reporter: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tagsInput: z.string().optional(),
});

type OccurrenceItemFormValues = z.infer<typeof occurrenceItemSchema>;

export function OccurrencesSection({ 
  occurrences, 
  onOccurrencesChange,
  disabled = false
}: OccurrencesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OccurrenceItem | null>(null);

  const form = useForm<OccurrenceItemFormValues>({
    resolver: zodResolver(occurrenceItemSchema),
    defaultValues: {
      title: "",
      description: "",
      time: new Date().toTimeString().slice(0, 5),
      reporter: "",
      tags: [],
      tagsInput: "",
    },
  });

  const openNewDialog = () => {
    form.reset({
      title: "",
      description: "",
      time: new Date().toTimeString().slice(0, 5),
      reporter: "",
      tags: [],
      tagsInput: "",
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: OccurrenceItem) => {
    form.reset({
      id: item.id,
      title: item.title,
      description: item.description,
      time: item.time,
      reporter: item.reporter,
      tags: item.tags,
      tagsInput: "",
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onOccurrencesChange(occurrences.filter(item => item.id !== id));
  };

  const onSubmit = (data: OccurrenceItemFormValues) => {
    // Process tags
    const finalTags = [...(data.tags || [])];
    
    if (data.tagsInput) {
      const newTags = data.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !finalTags.includes(tag));
      
      finalTags.push(...newTags);
    }
    
    const submissionData = {
      id: data.id,
      title: data.title,
      description: data.description,
      time: data.time,
      reporter: data.reporter || "",
      tags: finalTags
    };

    if (editingItem) {
      // Update existing item
      onOccurrencesChange(
        occurrences.map(item => 
          item.id === editingItem.id ? { ...submissionData, id: item.id } : item
        )
      );
    } else {
      // Add new item
      onOccurrencesChange([
        ...occurrences,
        { ...submissionData, id: uuidv4() }
      ]);
    }
    setIsDialogOpen(false);
  };

  const handleRemoveTag = (tagIndex: number) => {
    const currentTags = form.getValues("tags") || [];
    const newTags = [...currentTags];
    newTags.splice(tagIndex, 1);
    form.setValue("tags", newTags);
  };

  const handleAddTag = () => {
    const tagsInput = form.getValues("tagsInput");
    
    if (!tagsInput) return;
    
    const currentTags = form.getValues("tags") || [];
    const newTags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !currentTags.includes(tag));
    
    if (newTags.length > 0) {
      form.setValue("tags", [...currentTags, ...newTags]);
      form.setValue("tagsInput", "");
    }
  };

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "clima": "bg-blue-100 text-blue-800",
      "material": "bg-orange-100 text-orange-800",
      "segurança": "bg-red-100 text-red-800",
      "equipamento": "bg-purple-100 text-purple-800",
      "pessoal": "bg-green-100 text-green-800"
    };

    // Check for known tags or variations
    const normalizedTag = tag.toLowerCase();
    for (const [key, value] of Object.entries(tagColors)) {
      if (normalizedTag.includes(key)) {
        return value;
      }
    }

    // Default color
    return "bg-slate-100 text-slate-800";
  };

  const getOccurrenceIcon = (tags: string[]) => {
    const normalizedTags = tags.map(tag => tag.toLowerCase());
    
    if (normalizedTags.some(tag => tag.includes("clima") || tag.includes("chuva"))) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    
    if (normalizedTags.some(tag => tag.includes("segurança") || tag.includes("acidente"))) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    
    if (normalizedTags.some(tag => tag.includes("material") || tag.includes("entrega"))) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium leading-6 text-slate-900">Ocorrências / Eventos</h3>
        <Button 
          onClick={openNewDialog} 
          size="sm"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Ocorrência
        </Button>
      </div>

      {occurrences.length > 0 ? (
        <div className="space-y-3">
          {occurrences.map((occurrence) => (
            <div key={occurrence.id} className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-start">
                <div>
                  {getOccurrenceIcon(occurrence.tags)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-base font-medium text-slate-800">
                      {occurrence.title}
                    </h4>
                    <div className="text-sm text-slate-500">
                      {occurrence.time}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{occurrence.description}</p>
                  {occurrence.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {occurrence.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className={getTagColor(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {occurrence.reporter && (
                    <p className="text-xs text-slate-500">Reportado por: {occurrence.reporter}</p>
                  )}
                </div>
              </div>
              {!disabled && (
                <div className="mt-3 flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEditDialog(occurrence)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(occurrence.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="text-slate-500 mb-4">Nenhuma ocorrência registrada ainda.</p>
          <Button onClick={openNewDialog} disabled={disabled}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Ocorrência
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Ocorrência" : "Adicionar Ocorrência"}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Atraso na entrega de material" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reporter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reportado por</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome do responsável" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
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
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-1 min-h-6 mb-2">
                  {form.watch("tags")?.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className={getTagColor(tag)}
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="tagsInput"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder="Ex: Clima, Material, Segurança..." 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleAddTag}
                  >
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Separe múltiplas tags com vírgulas</p>
              </div>

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
