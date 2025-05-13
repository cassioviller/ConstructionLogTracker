import { pgTable, text, serial, integer, json, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  companyName: true,
  companyLogo: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  expectedEndDate: date("expected_end_date"),
  status: text("status").notNull(), // "active", "completed", "on_hold", "planning"
  progress: integer("progress").default(0),
  createdBy: integer("created_by").notNull(), // user id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  client: true,
  location: true,
  description: true,
  startDate: true,
  expectedEndDate: true,
  status: true,
  progress: true,
  createdBy: true,
});

// Project members table
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // "manager", "engineer", "worker"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).pick({
  projectId: true,
  userId: true,
  role: true,
});

// RDO (Relatório Diário de Obra) table
export const rdos = pgTable("rdos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  reportNumber: integer("report_number").notNull(), // Sequential by project
  date: date("date").notNull(),
  createdBy: integer("created_by").notNull(), // user id
  weatherMorning: text("weather_morning").notNull(), // "sunny", "cloudy", "rainy", "windy"
  weatherAfternoon: text("weather_afternoon").notNull(),
  weatherNight: text("weather_night").notNull(),
  weatherNotes: text("weather_notes"),
  status: text("status").notNull(), // "draft", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRdoSchema = createInsertSchema(rdos).pick({
  projectId: true,
  reportNumber: true,
  date: true,
  createdBy: true,
  weatherMorning: true,
  weatherAfternoon: true,
  weatherNight: true,
  weatherNotes: true,
  status: true,
});

// Workforce table (for RDO)
export const workforce = pgTable("workforce", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  role: text("role").notNull(), // "engineer", "foreman", "mason", "helper", etc.
  quantity: integer("quantity").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkforceSchema = createInsertSchema(workforce).pick({
  rdoId: true,
  role: true,
  quantity: true,
  startTime: true,
  endTime: true,
  notes: true,
});

// Equipment table (for RDO)
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  hoursUsed: integer("hours_used"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).pick({
  rdoId: true,
  name: true,
  quantity: true,
  hoursUsed: true,
  notes: true,
});

// Activities table (for RDO)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  description: text("description").notNull(),
  completionPercentage: integer("completion_percentage").default(0),
  status: text("status").notNull(), // "in_progress", "completed", "pending"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  rdoId: true,
  description: true,
  completionPercentage: true,
  status: true,
});

// Occurrences table (for RDO)
export const occurrences = pgTable("occurrences", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  time: text("time"),
  tags: json("tags").default([]), // Array of tags like ["material", "weather", "safety"]
  reportedBy: integer("reported_by").notNull(), // user id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOccurrenceSchema = createInsertSchema(occurrences).pick({
  rdoId: true,
  title: true,
  description: true,
  time: true,
  tags: true,
  reportedBy: true,
});

// Photos table (for RDO)
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  caption: text("caption"),
  uploadedBy: integer("uploaded_by").notNull(), // user id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  rdoId: true,
  fileName: true,
  fileUrl: true,
  caption: true,
  uploadedBy: true,
});

// Comments table (for RDO)
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  rdoId: integer("rdo_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  rdoId: true,
  userId: true,
  content: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;

export type RDO = typeof rdos.$inferSelect;
export type InsertRDO = z.infer<typeof insertRdoSchema>;

export type Workforce = typeof workforce.$inferSelect;
export type InsertWorkforce = z.infer<typeof insertWorkforceSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Occurrence = typeof occurrences.$inferSelect;
export type InsertOccurrence = z.infer<typeof insertOccurrenceSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Enums
export const weatherOptions = ["ensolarado", "nublado", "chuvoso", "ventoso"] as const;
export const projectStatusOptions = ["active", "completed", "on_hold", "planning"] as const;
export const rdoStatusOptions = ["draft", "completed"] as const;
export const activityStatusOptions = ["in_progress", "completed", "pending"] as const;
export const userRoleOptions = ["admin", "manager", "engineer", "foreman", "worker"] as const;
export const projectMemberRoleOptions = ["manager", "engineer", "worker"] as const;

// Extended schemas for form validation
export const extendedInsertUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
});
