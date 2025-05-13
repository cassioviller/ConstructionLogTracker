import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertOctagon, 
  AlertTriangle, 
  Droplets,
  Clock,
  Plus, 
  Trash2, 
  X 
} from "lucide-react";
import { z } from "zod";

// Occurrence schema
const occurrenceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título da ocorrência é obrigatório"),
  description: z.string().min(1, "Descrição da ocorrência é obrigatória"),
  time: z.string().optional(),
  tags: z.array(z.string()).optional(),
  reportedBy: z.number().optional(),
  reportedByName: z.string().optional(),
});

type Occurrence = z.infer<typeof occurrenceSchema>;

interface OccurrencesSectionProps {
  occurrences: Occurrence[];
  onChange: (occurrences: Occurrence[]) => void;
  userId?: number;
}

const OccurrencesSection = ({ 
  occurrences, 
  onChange, 
  userId 
}: OccurrencesSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentOccurrence, setCurrentOccurrence] = useState<Occurrence | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");

  // Common tags for occurrences
  const commonTags = [
    { id: "material", label: "Material", color: "bg-orange-100 text-orange-800" },
    { id: "clima", label: "Clima", color: "bg-blue-100 text-blue-800" },
    { id: "seguranca", label: "Segurança", color: "bg-red-100 text-red-800" },
    { id: "equipamento", label: "Equipamento", color: "bg-purple-100 text-purple-800" },
    { id: "pessoal", label: "Pessoal", color: "bg-green-100 text-green-800" },
    { id: "terceiros", label: "Terceiros", color: "bg-yellow-100 text-yellow-800" },
    { id: "projeto", label: "Projeto", color: "bg-indigo-100 text-indigo-800" },
  ];

  const getTagLabel = (tagId: string) => {
    const tag = commonTags.find(t => t.id === tagId);
    return tag ? tag.label : tagId;
  };

  const getTagColor = (tagId: string) => {
    const tag = commonTags.find(t => t.id === tagId);
    return tag ? tag.color : "bg-slate-100 text-slate-800";
  };

  const getOccurrenceIcon = (tags: string[] = []) => {
    if (tags.includes("seguranca")) {
      return <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />;
    } else if (tags.includes("clima")) {
      return <Droplets className="h-5 w-5 text-blue-500 mr-2" />;
    } else if (tags.includes("material") || tags.includes("equipamento")) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />;
    } else {
      return <Clock className="h-5 w-5 text-slate-500 mr-2" />;
    }
  };

  const handleOpenDialog = (occurrence?: Occurrence) => {
    if (occurrence) {
      setCurrentOccurrence(occurrence);
    } else {
      setCurrentOccurrence({
        id: crypto.randomUUID(),
        title: "",
        description: "",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: [],
        reportedBy: userId,
        reportedByName: "Usuário Atual", // In a real app, this would come from the user context
      });
    }
    setDialogOpen(true);
    setErrors({});
    setTagInput("");
  };

  const validateOccurrence = (occurrence: Occurrence): boolean => {
    try {
      occurrenceSchema.parse(occurrence);
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

  const handleSaveOccurrence = () => {
    if (currentOccurrence && validateOccurrence(currentOccurrence)) {
      if (occurrences.find((o) => o.id === currentOccurrence.id)) {
        onChange(
          occurrences.map((o) =>
            o.id === currentOccurrence.id ? currentOccurrence : o
          )
        );
      } else {
        onChange([...occurrences, currentOccurrence]);
      }
      setDialogOpen(false);
    }
  };

  const handleDeleteOccurrence = (idToDelete: string | undefined) => {
    if (idToDelete) {
      onChange(occurrences.filter((o) => o.id !== idToDelete));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && currentOccurrence) {
      const normalizedTag = tagInput.trim().toLowerCase();
      const existingTag = commonTags.find(t => 
        t.id === normalizedTag || 
        t.label.toLowerCase() === normalizedTag
      );
      
      // Use existing tag ID if found, otherwise use the input as is
      const tagToAdd = existingTag ? existingTag.id : normalizedTag;
      
      // Only add if not already in the tags array
      if (!currentOccurrence.tags?.includes(tagToAdd)) {
        setCurrentOccurrence({
          ...currentOccurrence,
          tags: [...(currentOccurrence.tags || []), tagToAdd],
        });
      }
      
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (currentOccurrence) {
      setCurrentOccurrence({
        ...currentOccurrence,
        tags: currentOccurrence.tags?.filter(tag => tag !== tagToRemove) || [],
      });
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {occurrences.length > 0 ? (
          occurrences.map((occurrence) => (
            <div key={occurrence.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    {getOccurrenceIcon(occurrence.tags)}
                    <h4 className="text-base font-medium text-slate-900">{occurrence.title}</h4>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">{occurrence.description}</p>
                  </div>
                  {occurrence.tags && occurrence.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {occurrence.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className={getTagColor(tag)}>
                          {getTagLabel(tag)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOccurrence(occurrence.id)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>{occurrence.time || ""}</span>
                <span>{occurrence.reportedByName || "Usuário"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-slate-500">
              Nenhuma ocorrência registrada. Adicione ocorrências relevantes usando o botão abaixo.
            </p>
          </div>
        )}

        <Button
          onClick={() => handleOpenDialog()}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Ocorrência
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentOccurrence?.id && occurrences.find(o => o.id === currentOccurrence.id)
                ? "Editar Ocorrência"
                : "Adicionar Ocorrência"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Ocorrência*</Label>
              <Input
                id="title"
                value={currentOccurrence?.title || ""}
                onChange={(e) =>
                  currentOccurrence && setCurrentOccurrence({
                    ...currentOccurrence,
                    title: e.target.value
                  })
                }
                placeholder="Ex: Atraso na entrega de material"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição*</Label>
              <Textarea
                id="description"
                value={currentOccurrence?.description || ""}
                onChange={(e) =>
                  currentOccurrence && setCurrentOccurrence({
                    ...currentOccurrence,
                    description: e.target.value
                  })
                }
                placeholder="Descreva o que ocorreu em detalhes..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={currentOccurrence?.time || ""}
                onChange={(e) =>
                  currentOccurrence && setCurrentOccurrence({
                    ...currentOccurrence,
                    time: e.target.value
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {currentOccurrence?.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className={`${getTagColor(tag)} px-2 py-1`}>
                    {getTagLabel(tag)}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remover</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex">
                <input
                  list="common-tags"
                  id="tags"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Digite tags (Ex: Material, Clima, etc.) e pressione Enter"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
              <datalist id="common-tags">
                {commonTags.map((tag) => (
                  <option key={tag.id} value={tag.label} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500">
                Tags comuns: {commonTags.map(tag => tag.label).join(", ")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveOccurrence}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OccurrencesSection;
