import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, FileBarChart, ImageIcon, PencilIcon, PlusIcon, UserPlus, UserIcon, Users, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema para validação do formulário de membro da equipe
const teamMemberSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  role: z.string().min(1, { message: "Função é obrigatória" }),
  company: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para validação do formulário de edição do projeto
const projectEditSchema = z.object({
  responsible: z.string().optional(),
  startDate: z.string().min(1, { message: "Data de início é obrigatória" }),
  endDate: z.string().min(1, { message: "Previsão de término é obrigatória" }),
  client: z.string().min(1, { message: "Cliente é obrigatório" }),
  location: z.string().min(1, { message: "Endereço é obrigatório" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
type ProjectEditFormValues = z.infer<typeof projectEditSchema>;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [projectEditOpen, setProjectEditOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });

  const { data: recentReports, isLoading: isReportsLoading } = useQuery({
    queryKey: [`/api/projects/${id}/reports`],
  });
  
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery({
    queryKey: [`/api/projects/${id}/team`],
  });
  
  // Buscar fotos para o projeto
  const { data: photos, isLoading: isPhotosLoading } = useQuery({
    queryKey: [`/api/photos`, { projectId: id }],
    queryFn: async () => {
      const res = await fetch(`/api/photos?projectId=${id}`);
      if (!res.ok) {
        throw new Error("Erro ao buscar fotos");
      }
      return await res.json();
    },
  });
  
  // Formulário para adicionar/editar membro da equipe
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      company: "",
      contact: "",
      notes: ""
    },
  });
  
  // Formulário para editar o projeto
  const projectForm = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      responsible: project?.responsible || "",
      startDate: project?.startDate || "",
      endDate: project?.endDate || "",
      client: project?.client || "",
      location: project?.location || "",
      status: project?.status || "active"
    }
  });

  // Mutação para criar membro da equipe
  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: TeamMemberFormValues) => {
      const res = await apiRequest(
        "POST",
        `/api/projects/${id}/team`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/team`] });
      toast({
        title: "Membro adicionado",
        description: "Membro da equipe adicionado com sucesso.",
      });
      setTeamMemberDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro da equipe: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar membro da equipe
  const updateTeamMemberMutation = useMutation({
    mutationFn: async (data: TeamMemberFormValues & { id: number }) => {
      const { id: memberId, ...memberData } = data;
      const res = await apiRequest(
        "PUT",
        `/api/team/${memberId}`,
        memberData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/team`] });
      toast({
        title: "Membro atualizado",
        description: "Membro da equipe atualizado com sucesso.",
      });
      setTeamMemberDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro da equipe: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir membro da equipe
  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest(
        "DELETE",
        `/api/team/${memberId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/team`] });
      toast({
        title: "Membro removido",
        description: "Membro da equipe removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover membro da equipe: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para atualizar o projeto
  const updateProjectMutation = useMutation({
    mutationFn: async (data: ProjectEditFormValues) => {
      const res = await apiRequest(
        "PUT",
        `/api/projects/${id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Projeto atualizado",
        description: "Projeto atualizado com sucesso.",
      });
      setProjectEditOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Effect para atualizar o formulário quando o projeto for carregado
  useEffect(() => {
    if (project) {
      projectForm.reset({
        responsible: project.responsible || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        client: project.client || "",
        location: project.location || "",
        status: project.status || "active"
      });
    }
  }, [project, projectForm]);
  
  // Handlers para o diálogo de membro da equipe
  const handleOpenTeamMemberDialog = (member?: any) => {
    if (member) {
      setCurrentMember(member);
      form.reset({
        name: member.name,
        role: member.role,
        company: member.company || "",
        contact: member.contact || "",
        notes: member.notes || "",
      });
    } else {
      setCurrentMember(null);
      form.reset({
        name: "",
        role: "",
        company: "",
        contact: "",
        notes: "",
      });
    }
    setTeamMemberDialogOpen(true);
  };

  const handleTeamMemberSubmit = (data: TeamMemberFormValues) => {
    if (currentMember) {
      updateTeamMemberMutation.mutate({
        ...data,
        id: currentMember.id,
      });
    } else {
      createTeamMemberMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-slate-600 mb-2">Projeto não encontrado</h3>
          <p className="text-slate-500 mb-4">O projeto que você procura não existe ou foi removido</p>
          <Link href="/projects">
            <Button>Voltar para Projetos</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Link href="/projects" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-500">{project.client} • {project.location}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              // Inicializar o formulário com os dados atuais do projeto
              projectForm.reset({
                responsible: project.responsible?.name || "",
                startDate: project.startDate,
                endDate: project.endDate,
                client: project.client,
                location: project.location,
                status: project.status || "active"
              });
              setProjectEditOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Responsável Técnico</h3>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                  {project.responsible?.name?.charAt(0) || "U"}
                </div>
                <span className="text-slate-800">{project.responsible?.name || "Não atribuído"}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Data de Início</h3>
              <p className="text-slate-800">{new Date(project.startDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Previsão de Término</h3>
              <p className="text-slate-800">{new Date(project.endDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Cliente</h3>
              <p className="text-slate-800">{project.client}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Endereço</h3>
              <p className="text-slate-800">{project.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Em andamento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Relatórios (RDOs)</h2>
              <Link href={`/project/${id}/new-rdo`}>
                <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium p-0">
                  Novo RDO
                </Button>
              </Link>
            </div>
            <div className="text-center py-6">
              <span className="text-4xl font-bold text-slate-800">
                {recentReports && Array.isArray(recentReports.items) ? recentReports.items.length : 0}
              </span>
              <p className="text-slate-500">RDOs criados</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <Link href={`/project/${id}/rdo-history`}>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Ver todos os relatórios</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Galeria</h2>
              <Link href={`/photos?projectId=${id}`}>
                <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium p-0">
                  Ver todas
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {isPhotosLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-md h-16 w-full bg-slate-200 animate-pulse"></div>
                ))
              ) : photos && photos.length > 0 ? (
                <>
                  {photos.slice(0, 5).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.caption || "Foto do projeto"}
                      className="rounded-md h-16 w-full object-cover"
                    />
                  ))}
                  {photos.length > 5 && (
                    <div className="relative h-16 rounded-md bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-500 font-medium">+{photos.length - 5}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-3 py-4 text-center text-slate-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>Nenhuma foto disponível</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Link href={`/photos?projectId=${id}`}>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Ver galeria completa</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Equipe</h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-blue-700 text-sm font-medium p-0"
                onClick={() => handleOpenTeamMemberDialog()}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Adicionar Membro
              </Button>
            </div>
            <div className="space-y-4">
              {isTeamLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/10">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-3">
                        {member.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-800">{member.name}</h3>
                        <p className="text-xs text-slate-500">{member.role}</p>
                        {member.company && <p className="text-xs text-slate-400">{member.company}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOpenTeamMemberDialog(member)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive/80" 
                        onClick={() => deleteTeamMemberMutation.mutate(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhum membro na equipe.</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleOpenTeamMemberDialog()}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar primeiro membro
                  </Button>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => handleOpenTeamMemberDialog()}
              >
                <span>Adicionar membro</span>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para editar projeto */}
      <Dialog open={projectEditOpen} onOpenChange={setProjectEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu projeto. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit((data) => updateProjectMutation.mutate(data))} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço do projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status do projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Em andamento</SelectItem>
                        <SelectItem value="onhold">Em espera</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável Técnico</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setProjectEditOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                  className="ml-2"
                >
                  {updateProjectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar/editar membros da equipe */}
      <Dialog open={teamMemberDialogOpen} onOpenChange={setTeamMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentMember ? "Editar Membro da Equipe" : "Adicionar Membro à Equipe"}
            </DialogTitle>
            <DialogDescription>
              {currentMember 
                ? "Atualize as informações do membro da equipe." 
                : "Preencha os dados do novo membro da equipe."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTeamMemberSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
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
                      <Input placeholder="Ex: Engenheiro, Técnico, Supervisor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone ou e-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações sobre o membro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTeamMemberDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending}
                >
                  {(createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentMember ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
