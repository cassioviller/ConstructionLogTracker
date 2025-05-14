import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Pencil, Trash2, Users } from "lucide-react";
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
import { 
  Checkbox
} from '@/components/ui/checkbox';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WorkforceItem, TeamMember } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

const workforceItemSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  role: z.string().min(1, { message: "Função é obrigatória" }),
  startTime: z.string().default("07:12"),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

type WorkforceFormValues = z.infer<typeof workforceItemSchema>;

interface WorkforceSectionProps {
  onChange: (workforce: WorkforceItem[]) => void;
  initialData?: WorkforceItem[];
  projectId?: number | string;
}

export function WorkforceSection({ onChange, initialData = [], projectId }: WorkforceSectionProps) {
  const { id: paramProjectId } = useParams();
  const effectiveProjectId = projectId || paramProjectId;
  
  const [workforce, setWorkforce] = useState<WorkforceItem[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Record<number, boolean>>({});
  const [allSelected, setAllSelected] = useState(false);

  // Busca a equipe do projeto
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery({
    queryKey: [`/api/projects/${effectiveProjectId}/team`],
    enabled: !!effectiveProjectId && isTeamDialogOpen,
  });

  const form = useForm<WorkforceFormValues>({
    resolver: zodResolver(workforceItemSchema),
    defaultValues: {
      name: "",
      role: "",
      startTime: "07:12",
      endTime: "",
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
  
  const handleTeamDialogOpenChange = (open: boolean) => {
    setIsTeamDialogOpen(open);
    if (open) {
      // Reset selections when opening
      setSelectedTeamMembers({});
      setAllSelected(false);
    }
  };
  
  const handleToggleSelectAll = () => {
    if (!teamMembers) return;
    
    const newAllSelected = !allSelected;
    setAllSelected(newAllSelected);
    
    const newSelection: Record<number, boolean> = {};
    if (newAllSelected) {
      teamMembers.forEach((member: TeamMember) => {
        newSelection[member.id] = true;
      });
    }
    
    setSelectedTeamMembers(newSelection);
  };
  
  const handleToggleMember = (memberId: number) => {
    setSelectedTeamMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
    
    // Check if all are selected after this change
    if (teamMembers) {
      const updatedSelection = {
        ...selectedTeamMembers,
        [memberId]: !selectedTeamMembers[memberId]
      };
      
      const allAreSelected = teamMembers.every((member: TeamMember) => 
        updatedSelection[member.id]
      );
      
      setAllSelected(allAreSelected);
    }
  };
  
  const handleAddTeamMembers = () => {
    if (!teamMembers) return;
    
    const selectedMembers = teamMembers.filter((member: TeamMember) => 
      selectedTeamMembers[member.id]
    );
    
    if (selectedMembers.length === 0) return;
    
    // Convert selected team members to workforce items
    const newWorkforceItems: WorkforceItem[] = selectedMembers.map((member: TeamMember) => ({
      id: uuidv4(),
      name: member.name,
      role: member.role,
      startTime: "07:12",
      endTime: "",
      notes: ""
    }));
    
    const updatedWorkforce = [...workforce, ...newWorkforceItems];
    setWorkforce(updatedWorkforce);
    onChange(updatedWorkforce);
    setIsTeamDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Colaboradores</h3>
          <div className="flex space-x-2">
            {/* Botão para adicionar membros da equipe do projeto */}
            <Dialog open={isTeamDialogOpen} onOpenChange={handleTeamDialogOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Adicionar Colaboradores
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Colaboradores</DialogTitle>
                  <DialogDescription>
                    Selecione os colaboradores do projeto que deseja adicionar neste relatório.
                  </DialogDescription>
                </DialogHeader>
                
                {isTeamLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !teamMembers || teamMembers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500">Nenhum colaborador cadastrado neste projeto.</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <Checkbox 
                        id="select-all" 
                        checked={allSelected}
                        onCheckedChange={handleToggleSelectAll}
                      />
                      <label 
                        htmlFor="select-all" 
                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Selecionar Todos
                      </label>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto mt-2">
                      {teamMembers.map((member: TeamMember) => (
                        <div key={member.id} className="flex items-center space-x-2 py-2 border-b border-slate-100">
                          <Checkbox 
                            id={`member-${member.id}`} 
                            checked={!!selectedTeamMembers[member.id]}
                            onCheckedChange={() => handleToggleMember(member.id)}
                          />
                          <div className="grid gap-1">
                            <label 
                              htmlFor={`member-${member.id}`} 
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {member.name}
                            </label>
                            <p className="text-xs text-slate-500">{member.role}{member.company ? ` - ${member.company}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    onClick={handleAddTeamMembers}
                    disabled={isTeamLoading || !teamMembers || teamMembers.length === 0 || Object.values(selectedTeamMembers).filter(Boolean).length === 0}
                  >
                    Adicionar Selecionados
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Botão para adicionar colaborador manualmente */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <PlusIcon className="h-4 w-4" />
                  + Adicionar Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Colaborador" : "Adicionar Colaborador"}</DialogTitle>
                  <DialogDescription>
                    Informe os detalhes do colaborador neste dia.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddOrUpdate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do colaborador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
          {workforce.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Observações</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {workforce.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.role}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.startTime} - {item.endTime || ""}</td>
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
              Nenhum colaborador adicionado. Utilize os botões acima para adicionar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
