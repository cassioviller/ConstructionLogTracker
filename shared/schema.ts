import { pgTable, text, serial, integer, boolean, timestamp, json, date, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// JSON type para campos de array/objetos
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Tabela de sessões para persistência de sessões no PostgreSQL
export const sessions = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Projects table schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").default("inProgress"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  status: true,
});

// Project Team table schema
export const projectTeam = pgTable("project_team", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectTeamSchema = createInsertSchema(projectTeam).omit({
  id: true,
  createdAt: true,
});

// RDO (Relatório Diário de Obra) table schema
export const rdos = pgTable("rdos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  number: integer("number").notNull(),
  date: date("date").notNull(),
  weatherMorning: text("weather_morning").notNull(),
  weatherAfternoon: text("weather_afternoon").notNull(),
  weatherNight: text("weather_night").notNull(),
  weatherNotes: text("weather_notes"),
  workforce: json("workforce").default([]),
  equipment: json("equipment").default([]),
  activities: json("activities").default([]),
  occurrences: json("occurrences").default([]),
  comments: json("comments").default([]),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertRdoSchema = createInsertSchema(rdos).omit({
  id: true,
  number: true,
  createdAt: true,
  createdBy: true,
  status: true,
});

// Photos table schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").references(() => rdos.id).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectTeam = typeof projectTeam.$inferSelect;
export type InsertProjectTeam = z.infer<typeof insertProjectTeamSchema>;

export type Rdo = typeof rdos.$inferSelect;
export type InsertRdo = z.infer<typeof insertRdoSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

// Extend the RDO types with more specific structure for UI
export type WorkforceItem = {
  id: string;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export type EquipmentItem = {
  id: string;
  name: string;
  quantity: number;
  hours: number;
  notes?: string;
};

export type ActivityItem = {
  id: string;
  description: string;
  completion: number;
  notes?: string;
};

export type OccurrenceItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  tags: string[];
  createdBy?: string;
};

export type CommentItem = {
  id: string;
  text: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    jobTitle: string;
  };
};

export type PhotoItem = {
  id: string;
  url: string;
  preview?: string;
  caption?: string;
  createdBy?: number;
  userName?: string;
  originalFile?: File;
  needsUpload?: boolean;
};

// Colaboradores table schema (anteriormente Team Members)
export const teamMembers = pgTable("colaboradores", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  startTime: text("start_time").default("07:12"),
  endTime: text("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
