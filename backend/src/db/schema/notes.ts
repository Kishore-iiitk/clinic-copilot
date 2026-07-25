import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role").notNull(),
  rawText: text("raw_text").notNull(),
  isSoap: boolean("is_soap").notNull().default(false),
  soapSubjective: text("soap_subjective"),
  soapObjective: text("soap_objective"),
  soapAssessment: text("soap_assessment"),
  soapPlan: text("soap_plan"),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
