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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

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

  // RDO routes
  app.get("/api/projects/:id/reports", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const month = req.query.month as string;

      const result = await storage.getRdos(projectId, { page, limit, search, month });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar relatórios" });
    }
  });
  
  // Rota para obter todos os RDOs (independente do projeto)
  app.get("/api/reports", requireAuth, async (req, res) => {
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
      const rdoData = insertRdoSchema.parse(req.body);
      const nextNumber = await storage.getNextRdoNumber(rdoData.projectId);
      
      const rdo = await storage.createRdo({
        ...rdoData,
        number: nextNumber,
        createdBy: req.user!.id,
        status: "completed"
      });
      
      res.status(201).json(rdo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar RDO" });
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

  // Recent reports for dashboard
  app.get("/api/recent-reports", requireAuth, async (req, res) => {
    try {
      const reports = await storage.getRecentReports(req.user!.id);
      res.json(reports);
    } catch (error) {
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
