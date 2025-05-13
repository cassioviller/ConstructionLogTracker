import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Pencil, Trash2, AlertCircle, Cloud, AlertTriangle, Clock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OccurrenceItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from 'uuid';

const occurrenceItemSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
  tags: z.array(z.string()).min(1, { message: "Selecione pelo menos uma tag" }),
});

type OccurrenceFormValues = z.infer<typeof occurrenceItemSchema>;

// Available tags for occurrences
const availableTags = [
  { id: "clima", label: "Clima", color: "blue" },
  { id: "material", label: "Material", color: "amber" },
  { id: "seguranca", label: "Segurança", color: "red" },
  { id: "equipamento", label: "Equipamento", color: "purple" },
  { id: "paralisacao", label: "Paralisação", color: "orange" },
  { id: "visita", label: "Visita", color: "green" },
  { id: "outro", label: "Outro", color: "slate" },
];

interface OccurrencesSectionProps {
  onChange: (occurrences: OccurrenceItem[]) => void;
  initialData?: OccurrenceItem[];
}

export function OccurrencesSection({ onChange, initialData = [] }: OccurrencesSectionProps) {
  const [occurrences, setOccurrences] = useState<OccurrenceItem[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user } = useAuth();

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceItemSchema),
    defaultValues: {
      title: "",
      description: "",
      time: new Date().toTimeString().slice(0, 5),
      tags: [],
    },
  });

  const handleAddOrUpdate = (data: OccurrenceFormValues) => {
    let updatedOccurrences: OccurrenceItem[];

    if (editingId) {
      // Update existing item
      updatedOccurrences = occurrences.map(item => 
        item.id === editingId ? { ...data, id: editingId, createdBy: item.createdBy } : item
      );
    } else {
      // Add new item
      updatedOccurrences = [
        ...occurrences,
        { 
          ...data, 
          id: uuidv4(),
          createdBy: user?.name || "Usuário"
        }
      ];
    }

    setOccurrences(updatedOccurrences);
    onChange(updatedOccurrences);
    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
    setSelectedTags([]);
  };

  const handleEdit = (item: OccurrenceItem) => {
    form.reset(item);
    setSelectedTags(item.tags);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedOccurrences = occurrences.filter(item => item.id !== id);
    setOccurrences(updatedOccurrences);
    onChange(updatedOccurrences);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset();
      setSelectedTags([]);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tagId);
      
      const newTags = isSelected
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId];
      
      form.setValue('tags', newTags);
      return newTags;
    });
  };

  const getTagColor = (tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    
    switch (tag?.color) {
      case 'blue': return "bg-blue-100 text-blue-800";
      case 'amber': return "bg-amber-100 text-amber-800";
      case 'red': return "bg-red-100 text-red-800";
      case 'purple': return "bg-purple-100 text-purple-800";
      case 'orange': return "bg-orange-100 text-orange-800";
      case 'green': return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getTagIcon = (tagId: string) => {
    switch (tagId) {
      case 'clima':
        return <Cloud className="h-4 w-4 mr-1" />;
      case 'seguranca':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'paralisacao':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Ocorrências / Eventos</h3>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusIcon className="h-4 w-4" />
                Adicionar Ocorrência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Ocorrência" : "Adicionar Ocorrência"}</DialogTitle>
                <DialogDescription>
                  Registre um evento ou ocorrência importante ocorrida no dia.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOrUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Ocorrência</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Paralisação por chuva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva detalhadamente o que ocorreu..." 
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
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {availableTags.map(tag => (
                            <Badge
                              key={tag.id}
                              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                              className={`cursor-pointer ${selectedTags.includes(tag.id) ? '' : 'hover:bg-slate-100'}`}
                              onClick={() => toggleTag(tag.id)}
                            >
                              {tag.label}
                            </Badge>
                          ))}
                        </div>
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
        
        <div className="bg-slate-50 p-4 rounded-lg">
          {occurrences.length > 0 ? (
            <div className="space-y-3">
              {occurrences.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-md border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {item.tags[0] && getTagIcon(item.tags[0])}
                        <h4 className="text-sm font-medium text-slate-800">{item.title}</h4>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                      <div className="mt-2 flex items-center flex-wrap gap-1">
                        {item.tags.map(tag => {
                          const tagInfo = availableTags.find(t => t.id === tag);
                          return (
                            <span 
                              key={tag} 
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                            >
                              {tagInfo?.label || tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-sm text-slate-500">
                      {item.time}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">{item.createdBy}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-3.5 w-3.5 text-slate-500 mr-1" />
                        <span className="text-xs">Editar</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500 mr-1" />
                        <span className="text-xs">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p className="mb-4">Nenhuma ocorrência registrada</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                Adicionar Ocorrência
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
