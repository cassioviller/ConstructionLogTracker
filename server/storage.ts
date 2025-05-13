import { users, projects, rdos, photos, projectMembers } from "@shared/schema";
import type { User, InsertUser, Project, InsertProject, RDO, InsertRDO, Photo, InsertPhoto, ProjectMember, InsertProjectMember } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLogo(id: number, logoPath: string): Promise<User>;
  
  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: InsertProject): Promise<Project | undefined>;
  
  // RDOs
  getRdosByProject(projectId: number): Promise<RDO[]>;
  getRdo(id: number): Promise<RDO | undefined>;
  getLastRdoByProject(projectId: number): Promise<RDO | undefined>;
  createRdo(rdo: InsertRDO): Promise<RDO>;
  updateRdo(id: number, rdo: InsertRDO): Promise<RDO | undefined>;
  
  // Photos
  getPhotosByProject(projectId: number): Promise<Photo[]>;
  getPhotosByRdo(rdoId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Project Members
  getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]>;
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private rdos: Map<number, RDO>;
  private photos: Map<number, Photo>;
  private projectMembers: Map<number, ProjectMember>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private rdoIdCounter: number;
  private photoIdCounter: number;
  private projectMemberIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.rdos = new Map();
    this.photos = new Map();
    this.projectMembers = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.rdoIdCounter = 1;
    this.photoIdCounter = 1;
    this.projectMemberIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Add demo data
    this.createInitialData();
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLogo(id: number, logoPath: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    const updatedUser = { ...user, companyLogo: logoPath };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { ...project, id, createdAt: new Date() };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: InsertProject): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async getRdosByProject(projectId: number): Promise<RDO[]> {
    return Array.from(this.rdos.values())
      .filter((rdo) => rdo.projectId === projectId)
      .sort((a, b) => b.reportNumber - a.reportNumber);
  }
  
  async getRdo(id: number): Promise<RDO | undefined> {
    return this.rdos.get(id);
  }
  
  async getLastRdoByProject(projectId: number): Promise<RDO | undefined> {
    const projectRdos = Array.from(this.rdos.values())
      .filter((rdo) => rdo.projectId === projectId)
      .sort((a, b) => b.reportNumber - a.reportNumber);
    
    return projectRdos.length > 0 ? projectRdos[0] : undefined;
  }
  
  async createRdo(rdo: InsertRDO): Promise<RDO> {
    const id = this.rdoIdCounter++;
    const newRdo: RDO = { ...rdo, id, createdAt: new Date() };
    this.rdos.set(id, newRdo);
    return newRdo;
  }
  
  async updateRdo(id: number, rdo: InsertRDO): Promise<RDO | undefined> {
    const existingRdo = this.rdos.get(id);
    if (!existingRdo) {
      return undefined;
    }
    
    const updatedRdo = { ...existingRdo, ...rdo };
    this.rdos.set(id, updatedRdo);
    return updatedRdo;
  }
  
  async getPhotosByProject(projectId: number): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter((photo) => photo.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPhotosByRdo(rdoId: number): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter((photo) => photo.rdoId === rdoId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const id = this.photoIdCounter++;
    const newPhoto: Photo = { ...photo, id, createdAt: new Date() };
    this.photos.set(id, newPhoto);
    return newPhoto;
  }
  
  async getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]> {
    return Array.from(this.projectMembers.values())
      .filter((member) => member.projectId === projectId)
      .map((member) => {
        const user = this.users.get(member.userId);
        if (!user) {
          throw new Error("Usuário não encontrado");
        }
        return { ...member, user };
      });
  }
  
  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const id = this.projectMemberIdCounter++;
    const newMember: ProjectMember = { ...member, id, createdAt: new Date() };
    this.projectMembers.set(id, newMember);
    return newMember;
  }

  private createInitialData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "$2b$10$IfYMj1wVVBaYxV7Wv9QbJOw6L5DHYCeS0KCX7HDjXuVSXIqTB7LBK", // "password"
      name: "João Silva",
      email: "joao@construtoraexemplo.com.br",
      role: "Engenheiro",
    };
    const user = this.createUser(demoUser);

    // Create demo projects
    const projects = [
      {
        name: "Edifício Corporativo Central",
        client: "Empresa ABC Ltda.",
        location: "São Paulo, SP",
        description: "Construção de edifício comercial de 10 andares com garagem subterrânea.",
        status: "active",
        startDate: new Date("2023-03-15"),
        endDate: new Date("2024-10-20"),
        progress: 65,
        userId: user.id,
      },
      {
        name: "Condomínio Residencial Parque das Flores",
        client: "Construtora XYZ",
        location: "Rio de Janeiro, RJ",
        description: "Conjunto de 5 torres residenciais com área de lazer completa.",
        status: "active",
        startDate: new Date("2023-05-10"),
        endDate: new Date("2024-12-15"),
        progress: 28,
        userId: user.id,
      },
      {
        name: "Ponte Metálica Rio Verde",
        client: "Prefeitura Municipal",
        location: "Curitiba, PR",
        description: "Construção de ponte metálica com 120m de extensão.",
        status: "paused",
        startDate: new Date("2023-01-20"),
        endDate: new Date("2024-04-30"),
        progress: 42,
        userId: user.id,
      }
    ];

    projects.forEach((project) => {
      this.createProject(project);
    });
  }
}

export const storage = new MemStorage();
