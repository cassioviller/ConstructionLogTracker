import { 
  users, User, InsertUser, 
  projects, Project, InsertProject, 
  rdos, Rdo, InsertRdo,
  photos, Photo, InsertPhoto,
  projectTeam,
  teamMembers, TeamMember, InsertTeamMember,
  sessions
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, asc, sql, and, like, or, isNotNull, count } from 'drizzle-orm';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Define interfaces for pagination and filtering
interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  month?: string;
}

interface PhotoFilterOptions {
  projectId?: number;
  search?: string;
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject & { createdBy: number }): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  
  // RDOs
  getRdos(projectId: number, options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }>;
  getAllRdos(options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }>;
  getRdo(id: number): Promise<Rdo | undefined>;
  getNextRdoNumber(projectId: number): Promise<number>;
  createRdo(rdo: InsertRdo & { number: number, createdBy: number, status: string }): Promise<Rdo>;
  updateRdo(id: number, data: Partial<Rdo>): Promise<Rdo | undefined>;
  deleteRdo(id: number): Promise<boolean>;
  getAllRdosForDebug(): Promise<Map<number, Rdo>>;
  
  // Photos
  getPhotos(options: PhotoFilterOptions): Promise<Photo[]>;
  getPhotosByRdoId(rdoId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto & { createdBy: number }): Promise<Photo>;
  
  // Team Members
  getTeamMembers(projectId: number): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember & { createdBy: number }): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Stats
  getStats(userId: number): Promise<any>;
  getRecentReports(userId: number, limit?: number): Promise<any[]>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private rdos: Map<number, Rdo>;
  private photos: Map<number, Photo>;
  private teams: Map<number, any[]>;
  private teamMembers: Map<number, TeamMember>;
  private userIdCounter: number;
  private projectIdCounter: number;
  private rdoIdCounter: number;
  private photoIdCounter: number;
  private teamMemberIdCounter: number;
  sessionStore: any; // Usando any para evitar problemas com o tipo SessionStore

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.rdos = new Map();
    this.photos = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.rdoIdCounter = 1;
    this.photoIdCounter = 1;
    this.teamMemberIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add a sample user for development
    this.createUser({
      username: "admin",
      password: "password", // Texto plano que será hashado pelo setupAuth
      name: "Administrador",
      jobTitle: "Engenheiro Civil",
      company: "Construtora XYZ"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    // Se houver uma senha e ela não for um hash, vamos criptografar
    if (userData.password && !userData.password.includes('.')) {
      const hashAsync = promisify(scrypt);
      const salt = randomBytes(16).toString("hex");
      const buf = (await hashAsync(userData.password, salt, 64)) as Buffer;
      userData.password = `${buf.toString("hex")}.${salt}`;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.createdBy === userId || this.isUserInProject(userId, project.id))
      .map(project => {
        const rdoCount = Array.from(this.rdos.values())
          .filter(rdo => rdo.projectId === project.id)
          .length;
          
        const photoCount = Array.from(this.photos.values())
          .filter(photo => {
            const rdo = this.rdos.get(photo.rdoId);
            return rdo && rdo.projectId === project.id;
          })
          .length;
          
        return {
          ...project,
          reportCount: rdoCount,
          photoCount: photoCount,
          team: this.getProjectTeam(project.id)
        };
      });
  }

  async getProject(id: number): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const rdoCount = Array.from(this.rdos.values())
      .filter(rdo => rdo.projectId === id)
      .length;
      
    const photoCount = Array.from(this.photos.values())
      .filter(photo => {
        const rdo = this.rdos.get(photo.rdoId);
        return rdo && rdo.projectId === id;
      })
      .length;
    
    return {
      ...project,
      reportCount: rdoCount,
      photoCount: photoCount,
      team: this.getProjectTeam(id)
    };
  }
  
  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = {
      ...project,
      ...data,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    
    return this.getProject(id);
  }

  async createProject(projectData: InsertProject & { createdBy: number }): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = {
      ...projectData,
      id,
      status: "inProgress",
      createdAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  // Helper methods for projects
  private isUserInProject(userId: number, projectId: number): boolean {
    const team = this.teams.get(projectId) || [];
    return team.some(member => member.userId === userId);
  }

  private getProjectTeam(projectId: number): any[] {
    return (this.teams.get(projectId) || []).map(member => {
      const user = this.users.get(member.userId);
      if (!user) return null;
      return {
        id: member.userId,
        name: user.name,
        jobTitle: user.jobTitle
      };
    }).filter(Boolean);
  }

  // RDO methods
  async getRdos(projectId: number, options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }> {
    const { page = 1, limit = 10, search, month } = options;
    
    console.log(`Método getRdos chamado - projectId: ${projectId}, Número de RDOs no sistema: ${this.rdos.size}`);
    
    // Listar todos os RDOs para debug
    console.log("RDOs disponíveis:", Array.from(this.rdos.entries()).map(([id, rdo]) => `ID: ${id}, projectId: ${rdo.projectId}, number: ${rdo.number}`));
    
    // Converter projectId para número para garantir a comparação correta
    const numericProjectId = Number(projectId);
    console.log(`Parâmetro projectId convertido para número: ${numericProjectId}`);
    
    let rdos = Array.from(this.rdos.values())
      .filter(rdo => {
        const rdoProjectId = Number(rdo.projectId);
        console.log(`Comparando: RDO projectId=${rdoProjectId} (${typeof rdoProjectId}) com parâmetro projectId=${numericProjectId} (${typeof numericProjectId})`);
        return rdoProjectId === numericProjectId;
      });
    
    console.log(`Após filtro inicial: ${rdos.length} RDOs com projectId=${projectId}`);
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      rdos = rdos.filter(rdo => {
        // Search in activities and occurrences
        const activitiesText = rdo.activities ? JSON.stringify(rdo.activities).toLowerCase() : '';
        const occurrencesText = rdo.occurrences ? JSON.stringify(rdo.occurrences).toLowerCase() : '';
        return activitiesText.includes(searchLower) || occurrencesText.includes(searchLower);
      });
    }
    
    // Apply month filter if provided
    if (month) {
      const monthNumber = parseInt(month);
      rdos = rdos.filter(rdo => {
        const rdoDate = new Date(rdo.date);
        return rdoDate.getMonth() + 1 === monthNumber;
      });
    }
    
    // Sort by date and number, most recent first
    rdos.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.number - a.number;
    });
    
    const total = rdos.length;
    const totalPages = Math.ceil(total / limit);
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    
    // Verificação de segurança para garantir que startIndex seja válido
    let paginatedRdos;
    if (startIndex >= rdos.length && page > 1 && rdos.length > 0) {
      console.log(`Erro na paginação: startIndex (${startIndex}) >= total de RDOs (${rdos.length})`);
      // Se não houver RDOs suficientes para a página solicitada, retorne a primeira página
      paginatedRdos = rdos.slice(0, limit);
      console.log(`Recuperando primeira página como fallback: ${paginatedRdos.length} RDOs`);
    } else {
      paginatedRdos = rdos.slice(startIndex, startIndex + limit);
    }
    
    console.log(`Após paginação: ${paginatedRdos.length} RDOs sendo retornados. Índices ${startIndex} a ${startIndex + limit}`);
    console.log(`Informações dos RDOs paginados: ${paginatedRdos.map(rdo => `ID: ${rdo.id}, projectId: ${rdo.projectId}, number: ${rdo.number}`)}`);
    
    // Add responsible info to each RDO
    const itemsWithResponsible = paginatedRdos.map(rdo => {
      const user = rdo.createdBy ? this.users.get(rdo.createdBy) : undefined;
      return {
        ...rdo,
        responsible: user ? {
          id: user.id,
          name: user.name,
          jobTitle: user.jobTitle
        } : undefined,
        workforceCount: Array.isArray(rdo.workforce) ? rdo.workforce.length : 0
      };
    });
    
    return {
      items: itemsWithResponsible,
      total,
      totalPages
    };
  }

  async getAllRdos(options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }> {
    const { page = 1, limit = 10, search, month } = options;
    
    // Get all RDOs without project filter
    let rdos = Array.from(this.rdos.values());
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      rdos = rdos.filter(rdo => {
        // Search in activities and occurrences
        const activitiesText = JSON.stringify(rdo.activities).toLowerCase();
        const occurrencesText = JSON.stringify(rdo.occurrences).toLowerCase();
        return activitiesText.includes(searchLower) || occurrencesText.includes(searchLower);
      });
    }
    
    // Apply month filter if provided
    if (month) {
      const monthNumber = parseInt(month);
      rdos = rdos.filter(rdo => {
        const rdoDate = new Date(rdo.date);
        return rdoDate.getMonth() + 1 === monthNumber;
      });
    }
    
    // Sort by date and number, most recent first
    rdos.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.number - a.number;
    });
    
    const total = rdos.length;
    const totalPages = Math.ceil(total / limit);
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedRdos = rdos.slice(startIndex, startIndex + limit);
    
    // Add responsible info and project info to each RDO
    const enhancedItems = paginatedRdos.map(rdo => {
      const user = rdo.createdBy ? this.users.get(rdo.createdBy) : undefined;
      const project = this.projects.get(rdo.projectId);
      
      return {
        ...rdo,
        responsible: user ? {
          id: user.id,
          name: user.name,
          jobTitle: user.jobTitle
        } : undefined,
        projectName: project?.name || "Projeto não encontrado",
        createdByName: user?.name || "Usuário não encontrado",
        workforceCount: Array.isArray(rdo.workforce) ? rdo.workforce.length : 0,
        occurrenceCount: Array.isArray(rdo.occurrences) ? rdo.occurrences.length : 0
      };
    });
    
    return {
      items: enhancedItems,
      total,
      totalPages
    };
  }

  async getRdo(id: number): Promise<Rdo | undefined> {
    const rdo = this.rdos.get(id);
    if (!rdo) return undefined;
    
    const user = rdo.createdBy ? this.users.get(rdo.createdBy) : undefined;
    const project = this.projects.get(rdo.projectId);
    
    return {
      ...rdo,
      responsible: user ? {
        id: user.id,
        name: user.name,
        jobTitle: user.jobTitle
      } : undefined,
      projectName: project?.name
    };
  }

  async getNextRdoNumber(projectId: number): Promise<number> {
    const projectRdos = Array.from(this.rdos.values())
      .filter(rdo => rdo.projectId === projectId);
    
    if (projectRdos.length === 0) return 1;
    
    const maxNumber = Math.max(...projectRdos.map(rdo => rdo.number));
    return maxNumber + 1;
  }

  async createRdo(rdoData: InsertRdo & { number: number, createdBy: number, status: string }): Promise<Rdo> {
    const id = this.rdoIdCounter++;
    const now = new Date();
    
    // Garantir que projectId seja numérico
    const projectId = Number(rdoData.projectId);
    
    console.log(`Criando RDO - ID: ${id}, projectId: ${projectId}, number: ${rdoData.number}`);
    
    const rdo: Rdo = {
      ...rdoData,
      id,
      projectId, // Usar o projectId convertido para número
      createdAt: now
    };
    
    this.rdos.set(id, rdo);
    
    // Verificação adicional
    console.log(`RDO criado e salvo - Verificando: ${this.rdos.has(id)}`);
    console.log(`RDOs atuais: ${Array.from(this.rdos.entries()).map(([id, r]) => `ID: ${id}, projectId: ${r.projectId}`)}`);
    
    return rdo;
  }
  
  async updateRdo(id: number, data: Partial<Rdo>): Promise<Rdo | undefined> {
    const rdo = this.rdos.get(id);
    if (!rdo) return undefined;
    
    // Atualizar o RDO com os dados fornecidos
    const updatedRdo = {
      ...rdo,
      ...data
    };
    
    this.rdos.set(id, updatedRdo);
    return updatedRdo;
  }
  
  async deleteRdo(id: number): Promise<boolean> {
    const exists = this.rdos.has(id);
    if (exists) {
      console.log(`Excluindo RDO com ID ${id}`);
      this.rdos.delete(id);
      
      // Também excluímos as fotos associadas a este RDO
      const photosToDelete = Array.from(this.photos.values())
        .filter(photo => photo.rdoId === id)
        .map(photo => photo.id);
      
      console.log(`Excluindo ${photosToDelete.length} fotos associadas ao RDO ${id}`);
      photosToDelete.forEach(photoId => {
        this.photos.delete(photoId);
      });
      
      return true;
    }
    console.log(`RDO com ID ${id} não encontrado para exclusão`);
    return false;
  }
  
  // Método de depuração para obter todos os RDOs diretamente
  async getAllRdosForDebug(): Promise<Map<number, Rdo>> {
    return Promise.resolve(this.rdos);
  }

  // Photo methods
  async getPhotos(options: PhotoFilterOptions): Promise<Photo[]> {
    const { projectId, search } = options;
    
    let photos = Array.from(this.photos.values());
    
    // Filter by project if specified
    if (projectId) {
      photos = photos.filter(photo => {
        const rdo = this.rdos.get(photo.rdoId);
        return rdo && rdo.projectId === projectId;
      });
    }
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      photos = photos.filter(photo => {
        return photo.caption?.toLowerCase().includes(searchLower);
      });
    }
    
    // Sort by date, most recent first
    photos.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Add project and user info
    return photos.map(photo => {
      const rdo = this.rdos.get(photo.rdoId);
      const project = rdo ? this.projects.get(rdo.projectId) : undefined;
      const user = photo.createdBy ? this.users.get(photo.createdBy) : undefined;
      
      return {
        ...photo,
        projectId: rdo?.projectId,
        projectName: project?.name,
        userName: user?.name
      };
    });
  }

  async createPhoto(photoData: InsertPhoto & { createdBy: number }): Promise<Photo> {
    const id = this.photoIdCounter++;
    const now = new Date();
    const photo: Photo = {
      ...photoData,
      id,
      createdAt: now
    };
    this.photos.set(id, photo);
    return photo;
  }
  
  /**
   * Buscar fotos associadas a um RDO específico
   */
  async getPhotosByRdoId(rdoId: number): Promise<Photo[]> {
    const photos = Array.from(this.photos.values())
      .filter(photo => photo.rdoId === rdoId);
    
    // Adicionar informações adicionais
    return photos.map(photo => {
      const rdo = this.rdos.get(photo.rdoId);
      const project = rdo ? this.projects.get(rdo.projectId) : undefined;
      const user = photo.createdBy ? this.users.get(photo.createdBy) : undefined;
      
      return {
        ...photo,
        projectId: rdo?.projectId,
        projectName: project?.name,
        userName: user?.name
      };
    });
  }

  // Stats methods
  async getStats(userId: number): Promise<any> {
    const userProjects = await this.getProjects(userId);
    const projectIds = userProjects.map(p => p.id);
    
    // Count reports
    const reports = Array.from(this.rdos.values())
      .filter(rdo => projectIds.includes(rdo.projectId));
    
    // Count photos
    const allPhotos = Array.from(this.photos.values());
    const photos = allPhotos.filter(photo => {
      const rdo = this.rdos.get(photo.rdoId);
      return rdo && projectIds.includes(rdo.projectId);
    });
    
    // New items in last week/month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const newProjects = userProjects.filter(p => p.createdAt && new Date(p.createdAt) > oneMonthAgo).length;
    const newReports = reports.filter(r => r.createdAt && new Date(r.createdAt) > oneWeekAgo).length;
    const newPhotos = photos.filter(p => p.createdAt && new Date(p.createdAt) > oneWeekAgo).length;
    
    return {
      projects: userProjects.length,
      reports: reports.length,
      photos: photos.length,
      newProjects,
      newReports,
      newPhotos
    };
  }

  async getRecentReports(userId: number, limit: number = 5): Promise<any[]> {
    const userProjects = await this.getProjects(userId);
    const projectIds = userProjects.map(p => p.id);
    
    const reports = Array.from(this.rdos.values())
      .filter(rdo => projectIds.includes(rdo.projectId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit) // Get most recent reports based on limit parameter
      .map(rdo => {
        const project = this.projects.get(rdo.projectId);
        const user = rdo.createdBy ? this.users.get(rdo.createdBy) : undefined;
        
        return {
          id: rdo.id,
          number: rdo.number,
          projectId: rdo.projectId,
          projectName: project?.name,
          date: rdo.date,
          status: rdo.status,
          weatherMorning: rdo.weatherMorning,
          workforceCount: Array.isArray(rdo.workforce) ? rdo.workforce.length : 0,
          responsible: user ? {
            id: user.id,
            name: user.name
          } : undefined
        };
      });
    
    return reports;
  }

  // Métodos de gerenciamento de membros da equipe
  async getTeamMembers(projectId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.projectId === projectId);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(memberData: InsertTeamMember & { createdBy: number }): Promise<TeamMember> {
    const id = this.teamMemberIdCounter++;
    const now = new Date();
    
    const teamMember: TeamMember = {
      ...memberData,
      id,
      createdAt: now
    };
    
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  async updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existingMember = this.teamMembers.get(id);
    if (!existingMember) return undefined;
    
    const updatedMember = {
      ...existingMember,
      ...data
    };
    
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    if (!this.teamMembers.has(id)) return false;
    return this.teamMembers.delete(id);
  }
}

// Implementação com PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Configuração para armazenar sessões no PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: 86400000 // 24 horas
    });
    
    console.log("DatabaseStorage inicializado com PostgreSQL");
    
    // Verifica se existem usuários e cria um usuário padrão se necessário
    this.getUserByUsername("admin").then(user => {
      if (!user) {
        console.log("Criando usuário admin padrão");
        this.createUser({
          username: "admin",
          password: "password", // Texto plano que será hashado pelo setupAuth
          name: "Administrador",
          jobTitle: "Administrador do Sistema",
          company: "MDOP",
        }).then(() => {
          console.log("Usuário padrão criado com sucesso!");
        });
      } else {
        console.log("Usuário admin já existe, pulando criação");
      }
    });
  }

  // Implementação dos métodos da interface IStorage usando PostgreSQL
  
  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`Buscando usuário pelo ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`Buscando usuário pelo username: ${username}`);
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por username:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      console.log(`Criando novo usuário: ${userData.username}`);
      const [user] = await db.insert(users).values(userData)
        .returning();
      console.log(`Usuário criado com sucesso: ID ${user.id}`);
      return user;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      console.log(`Atualizando usuário ID: ${id}`);
      
      // Se houver uma senha e ela não for um hash, vamos criptografar
      if (userData.password && !userData.password.includes('.')) {
        const hashAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buf = (await hashAsync(userData.password, salt, 64)) as Buffer;
        userData.password = `${buf.toString("hex")}.${salt}`;
      }
      
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
        
      if (!updatedUser) {
        console.log(`Nenhum usuário encontrado com ID: ${id}`);
        return undefined;
      }
      
      console.log(`Usuário atualizado com sucesso: ID ${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ID ${id}:`, error);
      throw error;
    }
  }

  // Projetos
  async getProjects(userId: number): Promise<Project[]> {
    try {
      console.log(`Buscando projetos para o usuário ID: ${userId}`);
      const projectsList = await db.select().from(projects)
        .where(eq(projects.createdBy, userId))
        .orderBy(desc(projects.createdAt));
      return projectsList;
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      console.log(`Buscando projeto pelo ID: ${id}`);
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error) {
      console.error("Erro ao buscar projeto:", error);
      return undefined;
    }
  }
  
  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      console.log(`Atualizando projeto ID: ${id}`);
      const [updatedProject] = await db
        .update(projects)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();
      console.log(`Projeto atualizado com sucesso: ${updatedProject.name}`);
      return updatedProject;
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      return undefined;
    }
  }

  async createProject(projectData: InsertProject & { createdBy: number }): Promise<Project> {
    try {
      console.log(`Criando novo projeto: ${projectData.name}`);
      const [project] = await db.insert(projects).values(projectData)
        .returning();
      console.log(`Projeto criado com sucesso: ID ${project.id}`);
      return project;
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      throw error;
    }
  }

  // RDOs
  async getRdos(projectId: number, options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const search = options.search;
      const month = options.month;
      
      console.log(`Buscando RDOs para o projeto ${projectId}, página ${page}, limite ${limit}`);
      
      // Converter projectId para número para garantir a comparação correta
      const numericProjectId = Number(projectId);
      
      // Log de depuração
      console.log(`Buscando por RDOs com projectId = ${numericProjectId}`);
      
      // Buscar todos RDOs deste projeto para debug
      const allProjectRdos = await db.select().from(rdos).where(eq(rdos.projectId, numericProjectId));
      console.log(`DEBUG - Total de RDOs para projeto ${numericProjectId} (sem filtros): ${allProjectRdos.length}`);
      
      if (allProjectRdos.length === 0) {
        console.log(`ATENÇÃO: Nenhum RDO encontrado para o projeto ${numericProjectId}`);
      } else {
        console.log(`IDs dos RDOs encontrados: ${allProjectRdos.map(r => r.id).join(', ')}`);
      }
      
      // Construir consulta base
      let query = db.select().from(rdos).where(eq(rdos.projectId, numericProjectId));
      
      // Aplicar filtro de busca se fornecido
      if (search) {
        console.log(`Aplicando filtro de busca: ${search}`);
        query = query.where(like(rdos.weatherNotes, `%${search}%`));
      }
      
      // Aplicar filtro de mês se fornecido
      if (month && month !== 'all') {
        console.log(`Aplicando filtro de mês: ${month}`);
        const monthNumber = parseInt(month);
        // No futuro, implementar filtro por mês usando funções SQL específicas do PostgreSQL
      }
      
      // Contar total para paginação
      const [result] = await db.select({ count: sql`count(*)` }).from(rdos)
        .where(eq(rdos.projectId, numericProjectId));
      const total = Number(result.count);
      console.log(`Total de registros encontrados: ${total}`);
      const totalPages = Math.ceil(total / limit);
      
      // Obter registros com paginação
      const offset = (page - 1) * limit;
      const rdosList = await query
        .orderBy(desc(rdos.date), desc(rdos.number))
        .limit(limit)
        .offset(offset);
      
      console.log(`Encontrados ${rdosList.length} RDOs para o projeto ${projectId} (com filtros aplicados)`);
      
      return {
        items: rdosList,
        total,
        totalPages
      };
    } catch (error) {
      console.error("Erro ao buscar RDOs:", error);
      return {
        items: [],
        total: 0,
        totalPages: 0
      };
    }
  }

  async getAllRdos(options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const search = options.search;
      const month = options.month;
      
      console.log(`Buscando todos os RDOs, página ${page}, limite ${limit}`);
      
      // Construir consulta base
      let query = db.select().from(rdos);
      
      // Aplicar filtro de busca se fornecido
      if (search) {
        query = query.where(like(rdos.weatherNotes, `%${search}%`));
      }
      
      // Aplicar filtro de mês se fornecido
      if (month && month !== 'all') {
        const monthNumber = parseInt(month);
        // Implementação simplificada
      }
      
      // Contar total para paginação
      const [result] = await db.select({ count: sql`count(*)` }).from(rdos);
      const total = Number(result.count);
      const totalPages = Math.ceil(total / limit);
      
      // Obter registros com paginação
      const offset = (page - 1) * limit;
      const rdosList = await query
        .orderBy(desc(rdos.date), desc(rdos.number))
        .limit(limit)
        .offset(offset);
      
      console.log(`Encontrados ${rdosList.length} RDOs no total`);
      
      return {
        items: rdosList,
        total,
        totalPages
      };
    } catch (error) {
      console.error("Erro ao buscar todos os RDOs:", error);
      return {
        items: [],
        total: 0,
        totalPages: 0
      };
    }
  }

  async getRdo(id: number): Promise<Rdo | undefined> {
    try {
      console.log(`Buscando RDO pelo ID: ${id}`);
      const [rdo] = await db.select().from(rdos).where(eq(rdos.id, id));
      return rdo;
    } catch (error) {
      console.error("Erro ao buscar RDO:", error);
      return undefined;
    }
  }

  async getNextRdoNumber(projectId: number): Promise<number> {
    try {
      console.log(`Calculando próximo número de RDO para o projeto ${projectId}`);
      const [result] = await db.select({ maxNumber: sql`max(number)` })
        .from(rdos)
        .where(eq(rdos.projectId, projectId));
      
      const maxNumber = result.maxNumber ? Number(result.maxNumber) : 0;
      return maxNumber + 1;
    } catch (error) {
      console.error("Erro ao calcular próximo número de RDO:", error);
      return 1; // Número padrão caso ocorra erro
    }
  }

  async createRdo(rdoData: InsertRdo & { number: number, createdBy: number, status: string }): Promise<Rdo> {
    try {
      // Garantir que projectId seja numérico
      const projectId = Number(rdoData.projectId);
      
      // Verificar se o projeto existe antes de criar o RDO
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error(`O projeto com ID ${projectId} não existe`);
      }
      
      console.log(`Criando novo RDO: Projeto ${projectId} (${project.name}), Número ${rdoData.number}`);
      
      // Log dos dados do RDO para validação
      console.log(`Dados do RDO a ser criado:`, JSON.stringify({
        projectId,
        number: rdoData.number,
        date: rdoData.date,
        status: rdoData.status,
        createdBy: rdoData.createdBy,
      }, null, 2));
      
      // Criar RDO no banco garantindo que o projectId seja explicitamente informado
      const [rdo] = await db.insert(rdos).values({
        ...rdoData,
        projectId
      }).returning();
      
      console.log(`RDO criado com sucesso: ID ${rdo.id}, vinculado ao projeto ${projectId}`);
      
      // Buscar o RDO recém-criado para confirmar que foi salvo corretamente
      const savedRdo = await this.getRdo(rdo.id);
      console.log(`RDO verificado: ID ${savedRdo?.id}, Projeto ${savedRdo?.projectId}`);
      
      return rdo;
    } catch (error) {
      console.error("Erro ao criar RDO:", error);
      throw error;
    }
  }

  async updateRdo(id: number, data: Partial<Rdo>): Promise<Rdo | undefined> {
    try {
      console.log(`Atualizando RDO ID: ${id}`);
      const [rdo] = await db.update(rdos)
        .set(data)
        .where(eq(rdos.id, id))
        .returning();
      
      console.log(`RDO atualizado com sucesso: ID ${rdo.id}`);
      return rdo;
    } catch (error) {
      console.error("Erro ao atualizar RDO:", error);
      return undefined;
    }
  }
  
  async deleteRdo(id: number): Promise<boolean> {
    try {
      console.log(`Excluindo RDO ID: ${id}`);
      
      // Primeiro excluir as fotos associadas ao RDO
      const photos = await this.getPhotosByRdoId(id);
      console.log(`Encontradas ${photos.length} fotos para excluir do RDO ${id}`);
      
      if (photos.length > 0) {
        await db.delete(photos)
          .where(eq(photos.rdoId, id));
        console.log(`Fotos do RDO ${id} excluídas com sucesso`);
      }
      
      // Depois excluir o RDO
      const result = await db.delete(rdos)
        .where(eq(rdos.id, id))
        .returning();
      
      const success = result.length > 0;
      console.log(success 
        ? `RDO ${id} excluído com sucesso` 
        : `RDO ${id} não encontrado para exclusão`);
      
      return success;
    } catch (error) {
      console.error(`Erro ao excluir RDO ${id}:`, error);
      return false;
    }
  }

  async getAllRdosForDebug(): Promise<Map<number, Rdo>> {
    try {
      // Carregar todos os RDOs para debug
      const allRdos = await db.select().from(rdos);
      const resultMap = new Map<number, Rdo>();
      
      allRdos.forEach(rdo => {
        resultMap.set(rdo.id, rdo);
      });
      
      console.log(`Carregados ${resultMap.size} RDOs para debug`);
      return resultMap;
    } catch (error) {
      console.error("Erro ao carregar RDOs para debug:", error);
      return new Map<number, Rdo>();
    }
  }

  // Fotos
  async getPhotos(options: PhotoFilterOptions): Promise<Photo[]> {
    try {
      console.log("Buscando fotos");
      let query = db.select().from(photos);
      
      if (options.projectId) {
        // Para buscar fotos por projeto, precisaríamos juntar com RDOs
        // Esta é uma implementação simplificada
        const projectRdos = await db.select({ id: rdos.id })
          .from(rdos)
          .where(eq(rdos.projectId, options.projectId));
        
        const rdoIds = projectRdos.map(r => r.id);
        if (rdoIds.length > 0) {
          // Se houver RDOs neste projeto, buscar suas fotos
          query = query.where(sql`rdo_id IN (${rdoIds.join(',')})`);
        } else {
          // Se não houver RDOs, retornar array vazio
          return [];
        }
      }
      
      if (options.search) {
        query = query.where(like(photos.caption, `%${options.search}%`));
      }
      
      const photosList = await query.orderBy(desc(photos.createdAt));
      return photosList;
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      return [];
    }
  }

  async getPhotosByRdoId(rdoId: number): Promise<Photo[]> {
    try {
      console.log(`Buscando fotos para o RDO ID: ${rdoId}`);
      const photosList = await db.select()
        .from(photos)
        .where(eq(photos.rdoId, rdoId))
        .orderBy(asc(photos.id));
      
      return photosList;
    } catch (error) {
      console.error("Erro ao buscar fotos do RDO:", error);
      return [];
    }
  }

  async createPhoto(photoData: InsertPhoto & { createdBy: number }): Promise<Photo> {
    try {
      console.log(`Salvando nova foto para o RDO ID: ${photoData.rdoId}`);
      const [photo] = await db.insert(photos).values(photoData).returning();
      console.log(`Foto salva com sucesso: ID ${photo.id}`);
      return photo;
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      throw error;
    }
  }

  // Membros da equipe
  async getTeamMembers(projectId: number): Promise<TeamMember[]> {
    try {
      console.log(`Buscando membros da equipe para o projeto ID: ${projectId}`);
      const teamList = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.projectId, projectId))
        .orderBy(asc(teamMembers.name));
      
      return teamList;
    } catch (error) {
      console.error("Erro ao buscar membros da equipe:", error);
      return [];
    }
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    try {
      console.log(`Buscando membro da equipe pelo ID: ${id}`);
      const [member] = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.id, id));
      
      return member;
    } catch (error) {
      console.error("Erro ao buscar membro da equipe:", error);
      return undefined;
    }
  }

  async createTeamMember(memberData: InsertTeamMember & { createdBy: number }): Promise<TeamMember> {
    try {
      console.log(`Criando novo membro de equipe: ${memberData.name}`);
      const [member] = await db.insert(teamMembers)
        .values(memberData)
        .returning();
      
      console.log(`Membro de equipe criado com sucesso: ID ${member.id}`);
      return member;
    } catch (error) {
      console.error("Erro ao criar membro de equipe:", error);
      throw error;
    }
  }

  async updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    try {
      console.log(`Atualizando membro de equipe ID: ${id}`);
      const [member] = await db.update(teamMembers)
        .set(data)
        .where(eq(teamMembers.id, id))
        .returning();
      
      console.log(`Membro de equipe atualizado com sucesso: ID ${member.id}`);
      return member;
    } catch (error) {
      console.error("Erro ao atualizar membro de equipe:", error);
      return undefined;
    }
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    try {
      console.log(`Excluindo membro de equipe ID: ${id}`);
      await db.delete(teamMembers)
        .where(eq(teamMembers.id, id));
      
      console.log(`Membro de equipe excluído com sucesso: ID ${id}`);
      return true;
    } catch (error) {
      console.error("Erro ao excluir membro de equipe:", error);
      return false;
    }
  }

  // Estatísticas
  async getStats(userId: number): Promise<any> {
    try {
      console.log(`Calculando estatísticas para o usuário ID: ${userId}`);
      
      // Total de projetos
      const [projectsCount] = await db.select({ count: sql`count(*)` })
        .from(projects)
        .where(eq(projects.createdBy, userId));
      
      // Total de RDOs
      const [rdosCount] = await db.select({ count: sql`count(*)` })
        .from(rdos)
        .where(eq(rdos.createdBy, userId));
      
      // Total de fotos
      const [photosCount] = await db.select({ count: sql`count(*)` })
        .from(photos)
        .where(eq(photos.createdBy, userId));
      
      // Projetos novos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [newProjectsCount] = await db.select({ count: sql`count(*)` })
        .from(projects)
        .where(and(
          eq(projects.createdBy, userId),
          sql`created_at >= ${thirtyDaysAgo.toISOString()}`
        ));
      
      return {
        projects: Number(projectsCount.count),
        reports: Number(rdosCount.count),
        photos: Number(photosCount.count),
        newProjects: Number(newProjectsCount.count)
      };
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
      return {
        projects: 0,
        reports: 0,
        photos: 0,
        newProjects: 0
      };
    }
  }

  async getRecentReports(userId: number, limit: number = 5): Promise<any[]> {
    try {
      console.log(`Buscando relatórios recentes para o usuário ID: ${userId}, limite: ${limit}`);
      
      // Buscar RDOs recentes
      const recentRdos = await db.select({
        id: rdos.id,
        number: rdos.number,
        date: rdos.date,
        projectId: rdos.projectId,
        status: rdos.status
      })
      .from(rdos)
      .where(eq(rdos.createdBy, userId))
      .orderBy(desc(rdos.date))
      .limit(limit);
      
      // Para cada RDO, buscar o nome do projeto
      const enhancedRdos = await Promise.all(recentRdos.map(async (rdo) => {
        const [project] = await db.select({ name: projects.name })
          .from(projects)
          .where(eq(projects.id, rdo.projectId));
        
        return {
          ...rdo,
          projectName: project ? project.name : 'Projeto desconhecido'
        };
      }));
      
      return enhancedRdos;
    } catch (error) {
      console.error("Erro ao buscar relatórios recentes:", error);
      return [];
    }
  }
}

// Exportar a instância DatabaseStorage para uso em toda a aplicação
export const storage = new DatabaseStorage();
