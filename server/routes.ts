import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generatePdfRdo } from "./pdf";
import { insertProjectSchema, insertRdoSchema, insertPhotoSchema, insertTeamMemberSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

// Função para garantir que exista um usuário admin
async function ensureAdminUser() {
  try {
    const adminUsername = 'admin';
    console.log(`Buscando usuário pelo username: ${adminUsername}`);
    const existingUser = await storage.getUserByUsername(adminUsername);
    
    if (!existingUser) {
      console.log('Criando usuário admin padrão...');
      // Usar a função de hash de senha do arquivo auth.ts
      const { hashPassword } = await import('./auth');
      
      // Senha padrão com hash
      const hashedPassword = await hashPassword('admin123');
      
      await storage.createUser({
        username: adminUsername,
        password: hashedPassword,
        name: 'Administrador',
        jobTitle: 'Administrador do Sistema',
        company: 'Diário de Obra Pro'
      });
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe, pulando criação');
    }
  } catch (error) {
    console.error('Erro ao criar/verificar usuário admin:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Garantir que existe um usuário admin
  await ensureAdminUser();

  const httpServer = createServer(app);
  
  // Rota para resetar a senha do admin (apenas em ambiente de desenvolvimento)
  app.post("/api/reset-admin", async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: "Esta operação não é permitida em ambiente de produção" });
    }
    
    try {
      const adminUser = await storage.getUserByUsername('admin');
      if (!adminUser) {
        return res.status(404).json({ message: "Usuário admin não encontrado" });
      }
      
      // Usar a função de hash do arquivo auth
      const { hashPassword } = await import('./auth');
      
      // Resetar para a senha padrão com hash
      const hashedPassword = await hashPassword('admin123');
      await storage.updateUser(adminUser.id, { password: hashedPassword });
      
      res.status(200).json({ message: "Senha do admin resetada com sucesso para 'admin123'" });
    } catch (error) {
      console.error('Erro ao resetar senha do admin:', error);
      res.status(500).json({ message: "Erro ao resetar senha do admin" });
    }
  });

  // Projects routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        createdBy: req.user!.id
      });
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar projeto" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = req.body;
      
      // Verificar se o projeto existe
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      // Verificar se o usuário tem permissão (somente o criador pode editar)
      if (project.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Sem permissão para editar este projeto" });
      }
      
      // Atualizar o projeto
      const updatedProject = await storage.updateProject(projectId, projectData);
      res.json(updatedProject);
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      res.status(500).json({ message: "Erro ao atualizar projeto" });
    }
  });

  // RDO routes
  // Esta rota serve tanto para /reports quanto para /rdos para compatibilidade
  app.get(["/api/projects/:id/reports", "/api/projects/:id/rdos"], requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const month = req.query.month as string;

      console.log(`Buscando RDOs para o projeto ${projectId}, página ${page}, limite ${limit}`);
      console.log(`Query params completos:`, req.query);
      
      // Verificar se o projeto existe
      const project = await storage.getProject(projectId);
      if (!project) {
        console.log(`Projeto ${projectId} não encontrado`);
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      console.log(`Projeto ${projectId} encontrado: ${project.name}`);
      
      // Lista todos os RDOs para depuração
      try {
        const debugMap = await storage.getAllRdosForDebug();
        const allRdos = Array.from(debugMap.values());
        console.log(`Total de RDOs no sistema: ${allRdos.length}`);
        console.log(`RDOs por projeto:`);
        
        // Agrupar RDOs por projectId
        const rdosByProject = allRdos.reduce((acc: Record<number, number>, rdo) => {
          const pidKey = rdo.projectId;
          acc[pidKey] = (acc[pidKey] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        console.log(JSON.stringify(rdosByProject, null, 2));
        
        // Mostrar dados completos dos RDOs para este projeto
        const projectRdos = allRdos.filter(rdo => rdo.projectId === projectId);
        console.log(`RDOs específicos para o projeto ${projectId}:`, 
          projectRdos.map(rdo => ({ 
            id: rdo.id, 
            projectId: rdo.projectId,
            number: rdo.number,
            date: rdo.date
          }))
        );
      } catch (debugError) {
        console.error("Erro ao carregar RDOs para debug:", debugError);
      }

      // Obter RDOs do projeto com paginação
      const result = await storage.getRdos(projectId, { page, limit, search, month });
      console.log(`Resultado da busca: ${result.items.length} RDOs encontrados para o projeto ${projectId}`);
      
      // Enviar resposta detalhada
      console.log("Respondendo com:", JSON.stringify(result));
      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      res.status(500).json({ 
        message: "Erro ao buscar relatórios",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter todos os RDOs (independente do projeto)
  // Esta rota serve tanto para /reports quanto para /rdos para compatibilidade
  app.get(["/api/reports", "/api/rdos"], requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const month = req.query.month as string;

      const result = await storage.getAllRdos({ page, limit, search, month });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar todos os relatórios" });
    }
  });

  app.get("/api/projects/:id/next-rdo-number", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const nextNumber = await storage.getNextRdoNumber(projectId);
      res.json(nextNumber);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar número de RDO" });
    }
  });

  app.post("/api/rdos", requireAuth, async (req, res) => {
    try {
      console.log("Solicitação para criar novo RDO:", JSON.stringify(req.body, null, 2));
      
      // Validar dados do RDO
      const rdoData = insertRdoSchema.parse(req.body);
      
      // Validar projectId - fundamental para a associação correta
      if (!rdoData.projectId) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: [{ path: ["projectId"], message: "O ID do projeto é obrigatório" }]
        });
      }
      
      // Verificar se o projeto existe
      const project = await storage.getProject(rdoData.projectId);
      if (!project) {
        return res.status(404).json({ 
          message: "Projeto não encontrado", 
          errors: [{ path: ["projectId"], message: `Projeto com ID ${rdoData.projectId} não existe` }]
        });
      }
      
      console.log(`Gerando próximo número de RDO para o projeto ${rdoData.projectId} (${project.name})`);
      const nextNumber = await storage.getNextRdoNumber(rdoData.projectId);
      
      console.log(`Criando RDO com número ${nextNumber} para o projeto ${rdoData.projectId}`);
      const rdo = await storage.createRdo({
        ...rdoData,
        number: nextNumber,
        createdBy: req.user!.id,
        status: "completed"
      });
      
      // Confirmar que o RDO foi criado corretamente
      console.log(`RDO criado com sucesso: ID ${rdo.id}, Projeto ${rdo.projectId}`);
      
      res.status(201).json(rdo);
    } catch (error) {
      console.error("Erro ao criar RDO:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      
      // Mensagem de erro mais específica para diagnóstico
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar RDO";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/rdos/:id", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      const rdo = await storage.getRdo(rdoId);
      
      if (!rdo) {
        return res.status(404).json({ message: "RDO não encontrado" });
      }
      
      res.json(rdo);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar RDO" });
    }
  });
  
  // Rota para atualizar um RDO
  app.put("/api/rdos/:id", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      
      // Verificar se o RDO existe
      const existingRdo = await storage.getRdo(rdoId);
      if (!existingRdo) {
        return res.status(404).json({ message: "RDO não encontrado" });
      }
      
      // Parse e validação dos dados
      const rdoData = insertRdoSchema.partial().parse(req.body);
      
      // Atualizar RDO
      const updatedRdo = await storage.updateRdo(rdoId, rdoData);
      
      if (!updatedRdo) {
        return res.status(500).json({ message: "Erro ao atualizar RDO" });
      }
      
      console.log(`RDO ${rdoId} atualizado com sucesso`);
      res.json(updatedRdo);
    } catch (error) {
      console.error("Erro ao atualizar RDO:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar RDO";
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Rota para excluir um RDO
  app.delete("/api/rdos/:id", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      
      // Verificar se o RDO existe
      const existingRdo = await storage.getRdo(rdoId);
      if (!existingRdo) {
        return res.status(404).json({ message: "RDO não encontrado" });
      }
      
      // Excluir o RDO
      const success = await storage.deleteRdo(rdoId);
      
      if (success) {
        console.log(`RDO ${rdoId} excluído com sucesso`);
        res.status(200).json({ message: "RDO excluído com sucesso" });
      } else {
        console.error(`Falha ao excluir RDO ${rdoId}`);
        res.status(500).json({ message: "Falha ao excluir RDO" });
      }
    } catch (error) {
      console.error("Erro ao excluir RDO:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir RDO";
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Rota para obter fotos de um RDO específico
  app.get("/api/rdos/:id/photos", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      const photos = await storage.getPhotosByRdoId(rdoId);
      res.json(photos);
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      res.status(500).json({ message: "Erro ao buscar fotos do RDO" });
    }
  });
  
  app.patch("/api/rdos/:id", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      const existingRdo = await storage.getRdo(rdoId);
      
      if (!existingRdo) {
        return res.status(404).json({ message: "RDO não encontrado" });
      }
      
      // Permitir atualização parcial do RDO
      const updatedRdo = await storage.updateRdo(rdoId, req.body);
      
      res.json(updatedRdo);
    } catch (error) {
      console.error("Erro ao atualizar RDO:", error);
      res.status(500).json({ message: "Erro ao atualizar relatório" });
    }
  });

  app.get("/api/rdos/:id/pdf", requireAuth, async (req, res) => {
    try {
      const rdoId = parseInt(req.params.id);
      const rdo = await storage.getRdo(rdoId);
      
      if (!rdo) {
        return res.status(404).json({ message: "RDO não encontrado" });
      }
      
      const project = await storage.getProject(rdo.projectId);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      const pdf = await generatePdfRdo(rdo, project);
      
      res.contentType('application/pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar PDF" });
    }
  });

  // Photos routes
  app.get("/api/photos", requireAuth, async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const search = req.query.search as string;
      
      const photos = await storage.getPhotos({ projectId, search });
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar fotos" });
    }
  });

  app.post("/api/photos", requireAuth, async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto({
        ...photoData,
        createdBy: req.user!.id
      });
      
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar foto" });
    }
  });

  // Stats for dashboard
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Rotas de depuração (temporárias)
  app.get("/api/debug/setup", async (req, res) => {
    try {
      // Verificar se já existe o usuário 'admin'
      let admin = await storage.getUserByUsername("admin");
      
      // Se não existir, criar usuário admin
      if (!admin) {
        admin = await storage.createUser({
          username: "admin",
          password: "password", // Não precisamos encriptar na rota de debug
          name: "Administrador",
          jobTitle: "Administrador",
          company: "Empresa Teste"
        });
        console.log("Usuário admin criado:", admin);
      } else {
        console.log("Usuário admin já existe:", admin);
      }
      
      // Criar um projeto de teste, se não houver nenhum
      const projects = await storage.getProjects(admin.id);
      let project;
      
      if (projects.length === 0) {
        project = await storage.createProject({
          name: "Projeto Teste",
          client: "Cliente Teste",
          location: "Local Teste",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          description: "Projeto de teste para depuração",
          status: "Em andamento",
          createdBy: admin.id
        });
        console.log("Projeto de teste criado:", project);
      } else {
        project = projects[0];
        console.log("Projeto já existe:", project);
      }
      
      // Criar um RDO de teste, se não houver nenhum
      const rdoNumber = await storage.getNextRdoNumber(project.id);
      await storage.createRdo({
        projectId: project.id,
        date: new Date().toISOString().split('T')[0],
        number: rdoNumber,
        weatherMorning: "Ensolarado",
        weatherAfternoon: "Ensolarado",
        weatherNight: "Limpo",
        weatherNotes: "Tempo estável",
        workforce: JSON.stringify([{ id: "1", role: "Pedreiro", quantity: 5, startTime: "08:00", endTime: "17:00" }]),
        equipment: JSON.stringify([{ id: "1", name: "Betoneira", quantity: 1, hours: 8 }]),
        activities: JSON.stringify([{ id: "1", description: "Concretagem", completion: 80 }]),
        occurrences: JSON.stringify([{ id: "1", title: "Atraso material", description: "Atraso na entrega de material", time: "10:00", tags: ["atraso", "material"] }]),
        comments: JSON.stringify([{ id: "1", content: "Trabalho realizado conforme cronograma", userId: admin.id, userName: admin.name }]),
        createdBy: admin.id,
        status: "Finalizado"
      });
      
      res.json({
        message: "Ambiente de teste configurado com sucesso",
        admin,
        project,
        rdoCount: (await storage.getRdos(project.id, {})).items.length
      });
    } catch (error) {
      console.error("Erro na configuração do ambiente de teste:", error);
      res.status(500).json({ message: "Erro na configuração do ambiente de teste", error: String(error) });
    }
  });
  
  // Rota de depuração para verificar RDOs diretamente (temporária)
  app.get("/api/debug/rdos", async (req, res) => {
    try {
      const rdosMap = await storage.getAllRdosForDebug();
      const rdos = Array.from(rdosMap.entries()).map(([id, rdo]: [number, any]) => ({
        id,
        projectId: rdo.projectId,
        number: rdo.number,
        date: rdo.date,
        status: rdo.status
      }));
      res.json({ count: rdos.length, rdos });
    } catch (error) {
      console.error("Erro ao depurar RDOs:", error);
      res.status(500).json({ message: "Erro ao depurar RDOs" });
    }
  });

  // Recent reports for dashboard
  app.get(["/api/recent-reports", "/api/reports/recent"], requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      console.log("Buscando relatórios recentes para o usuário ID:", req.user!.id);
      const reports = await storage.getRecentReports(req.user!.id, limit);
      console.log(`Encontrados ${reports.length} relatórios recentes`);
      res.json(reports);
    } catch (error) {
      console.error("Erro ao buscar relatórios recentes:", error);
      res.status(500).json({ message: "Erro ao buscar relatórios recentes" });
    }
  });

  // Team Members routes
  app.get("/api/projects/:projectId/team", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      const teamMembers = await storage.getTeamMembers(projectId);
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar membros da equipe" });
    }
  });

  app.post("/api/projects/:projectId/team", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      const memberData = insertTeamMemberSchema.parse({
        ...req.body,
        projectId
      });
      
      const member = await storage.createTeamMember({
        ...memberData,
        projectId,
        createdBy: req.user!.id
      });
      
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar membro da equipe" });
    }
  });

  app.put("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getTeamMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Membro não encontrado" });
      }
      
      const updatedMember = await storage.updateTeamMember(id, req.body);
      res.json(updatedMember);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar membro da equipe" });
    }
  });

  app.delete("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getTeamMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Membro não encontrado" });
      }
      
      await storage.deleteTeamMember(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir membro da equipe" });
    }
  });

  return httpServer;
}
