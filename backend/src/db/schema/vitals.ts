import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vitalsTable = pgTable("vitals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  heartRate: integer("heart_rate").notNull(),
  spo2: integer("spo2").notNull(),
  bpSystolic: integer("bp_systolic").notNull(),
  bpDiastolic: integer("bp_diastolic").notNull(),
  temperature: numeric("temperature", { precision: 4, scale: 1 }).notNull(),
  respiratoryRate: integer("respiratory_rate").notNull(),
});

export const insertVitalsSchema = createInsertSchema(vitalsTable).omit({ id: true, recordedAt: true });
export type InsertVitals = z.infer<typeof insertVitalsSchema>;
export type Vitals = typeof vitalsTable.$inferSelect;
