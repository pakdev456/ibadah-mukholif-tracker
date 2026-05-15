import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const violationsTable = pgTable("violations", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  kelas: text("kelas").notNull(),
  asrama: text("asrama").notNull(),
  waktu: text("waktu").notNull(),
  jenisPelanggaran: text("jenis_pelanggaran").notNull(),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertViolationSchema = createInsertSchema(violationsTable).omit({ id: true, createdAt: true });
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violationsTable.$inferSelect;
