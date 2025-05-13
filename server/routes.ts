import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { insertProjectSchema, insertRdoSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Apenas JPG, PNG e MP4 são permitidos.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projects = await storage.getProjects(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar projetos");
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).send("Projeto não encontrado");
      }
      
      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar projeto");
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).send("Erro ao criar projeto");
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.id);
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const project = await storage.updateProject(projectId, projectData);
      
      if (!project) {
        return res.status(404).send("Projeto não encontrado");
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).send("Erro ao atualizar projeto");
    }
  });

  // RDOs
  app.get("/api/projects/:projectId/rdos", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.projectId);
      const rdos = await storage.getRdosByProject(projectId);
      res.json(rdos);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar RDOs");
    }
  });

  app.get("/api/rdos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const rdoId = parseInt(req.params.id);
      const rdo = await storage.getRdo(rdoId);
      
      if (!rdo) {
        return res.status(404).send("RDO não encontrado");
      }
      
      res.json(rdo);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar RDO");
    }
  });

  app.post("/api/projects/:projectId/rdos", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get next report number
      const lastRdo = await storage.getLastRdoByProject(projectId);
      const reportNumber = lastRdo ? lastRdo.reportNumber + 1 : 1;
      
      const rdoData = insertRdoSchema.parse({
        ...req.body,
        projectId,
        reportNumber,
        userId: req.user.id
      });
      
      const rdo = await storage.createRdo(rdoData);
      res.status(201).json(rdo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).send("Erro ao criar RDO");
    }
  });

  app.put("/api/rdos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const rdoId = parseInt(req.params.id);
      const rdoData = insertRdoSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const rdo = await storage.updateRdo(rdoId, rdoData);
      
      if (!rdo) {
        return res.status(404).send("RDO não encontrado");
      }
      
      res.json(rdo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).send("Erro ao atualizar RDO");
    }
  });

  // Photos
  app.post("/api/photos/upload", upload.array("photos", 10), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const files = req.files as Express.Multer.File[];
      const rdoId = parseInt(req.body.rdoId);
      const projectId = parseInt(req.body.projectId);
      const captions = JSON.parse(req.body.captions || '{}');
      
      const photoResults = [];
      
      for (const file of files) {
        const photoData = {
          rdoId,
          projectId,
          caption: captions[file.filename] || '',
          path: file.path
        };
        
        const photo = await storage.createPhoto(photoData);
        photoResults.push(photo);
      }
      
      res.status(201).json(photoResults);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao fazer upload de fotos");
    }
  });

  app.get("/api/projects/:projectId/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.projectId);
      const photos = await storage.getPhotosByProject(projectId);
      res.json(photos);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar fotos");
    }
  });

  app.get("/api/rdos/:rdoId/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const rdoId = parseInt(req.params.rdoId);
      const photos = await storage.getPhotosByRdo(rdoId);
      res.json(photos);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar fotos");
    }
  });

  // Project Members
  app.get("/api/projects/:projectId/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.projectId);
      const members = await storage.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao buscar membros do projeto");
    }
  });

  app.post("/api/projects/:projectId/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const projectId = parseInt(req.params.projectId);
      const memberData = {
        projectId,
        userId: parseInt(req.body.userId),
        role: req.body.role
      };
      
      const member = await storage.addProjectMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao adicionar membro ao projeto");
    }
  });

  // Logo upload
  app.post("/api/user/logo", upload.single("logo"), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Não autorizado");
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send("Nenhum arquivo enviado");
      }
      
      const user = await storage.updateUserLogo(req.user.id, file.path);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao fazer upload do logo");
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
