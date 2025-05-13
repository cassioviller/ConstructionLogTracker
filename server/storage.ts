import { 
  users, User, InsertUser, 
  projects, Project, InsertProject, 
  rdos, Rdo, InsertRdo,
  photos, Photo, InsertPhoto,
  projectTeam,
  teamMembers, TeamMember, InsertTeamMember
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject & { createdBy: number }): Promise<Project>;
  
  // RDOs
  getRdos(projectId: number, options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }>;
  getAllRdos(options: PaginationOptions): Promise<{ items: Rdo[], total: number, totalPages: number }>;
  getRdo(id: number): Promise<Rdo | undefined>;
  getNextRdoNumber(projectId: number): Promise<number>;
  createRdo(rdo: InsertRdo & { number: number, createdBy: number, status: string }): Promise<Rdo>;
  
  // Photos
  getPhotos(options: PhotoFilterOptions): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto & { createdBy: number }): Promise<Photo>;
  
  // Team Members
  getTeamMembers(projectId: number): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember & { createdBy: number }): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Stats
  getStats(userId: number): Promise<any>;
  getRecentReports(userId: number): Promise<any[]>;
  
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
      username: "admin@example.com",
      password: "$2b$10$GvU2Zfws.aYthRqwrZKPnuOnjpO7WuB33nPLd1.ZMjyP5XvlV4tVa", // "password"
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
    
    let rdos = Array.from(this.rdos.values())
      .filter(rdo => rdo.projectId === projectId);
    
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
    const rdo: Rdo = {
      ...rdoData,
      id,
      createdAt: now
    };
    this.rdos.set(id, rdo);
    return rdo;
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

  async getRecentReports(userId: number): Promise<any[]> {
    const userProjects = await this.getProjects(userId);
    const projectIds = userProjects.map(p => p.id);
    
    const reports = Array.from(this.rdos.values())
      .filter(rdo => projectIds.includes(rdo.projectId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5) // Get most recent 5
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

export const storage = new MemStorage();
