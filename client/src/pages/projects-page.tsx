import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertProjectSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const projectFormSchema = insertProjectSchema.extend({
  startDate: z.string().min(1, { message: "Data de início é obrigatória" }),
  endDate: z.string().min(1, { message: "Data de previsão é obrigatória" }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectsPage() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      client: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", newProject);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsNewProjectOpen(false);
      form.reset();
      toast({
        title: "Projeto criado",
        description: "O projeto foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    createProjectMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projetos</h1>
          <p className="text-slate-500">Gerencie todos os seus projetos de obra</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar novo projeto</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo projeto de obra.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Edifício Antares" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Construtora XYZ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo - SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previsão de Término</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Breve descrição do projeto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createProjectMutation.isPending}>
                      {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-slate-500 mb-4">Crie seu primeiro projeto para começar</p>
              <Button onClick={() => setIsNewProjectOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Projeto
              </Button>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
