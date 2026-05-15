import { Router } from "express";
import { db, violationsTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

router.get("/violations", async (req, res) => {
  try {
    const { studentName, kelas, asrama, jenisPelanggaran } = req.query as Record<string, string | undefined>;

    const conditions: SQL[] = [];
    if (studentName) conditions.push(ilike(violationsTable.studentName, `%${studentName}%`));
    if (kelas) conditions.push(eq(violationsTable.kelas, kelas));
    if (asrama) conditions.push(eq(violationsTable.asrama, asrama));
    if (jenisPelanggaran) conditions.push(ilike(violationsTable.jenisPelanggaran, `%${jenisPelanggaran}%`));

    const rows = conditions.length > 0
      ? await db.select().from(violationsTable).where(and(...conditions)).orderBy(violationsTable.createdAt)
      : await db.select().from(violationsTable).orderBy(violationsTable.createdAt);

    res.json(rows.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list violations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/violations", async (req, res) => {
  try {
    const { studentName, kelas, asrama, waktu, jenisPelanggaran, catatan } = req.body as {
      studentName: string;
      kelas: string;
      asrama: string;
      waktu: string;
      jenisPelanggaran: string;
      catatan?: string;
    };

    const [row] = await db.insert(violationsTable).values({
      studentName,
      kelas,
      asrama,
      waktu,
      jenisPelanggaran,
      catatan: catatan ?? null,
    }).returning();

    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/violations/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(violationsTable).where(eq(violationsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/violations/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { studentName, kelas, asrama, waktu, jenisPelanggaran, catatan } = req.body as Partial<{
      studentName: string;
      kelas: string;
      asrama: string;
      waktu: string;
      jenisPelanggaran: string;
      catatan: string;
    }>;

    const updateData: Record<string, unknown> = {};
    if (studentName !== undefined) updateData.studentName = studentName;
    if (kelas !== undefined) updateData.kelas = kelas;
    if (asrama !== undefined) updateData.asrama = asrama;
    if (waktu !== undefined) updateData.waktu = waktu;
    if (jenisPelanggaran !== undefined) updateData.jenisPelanggaran = jenisPelanggaran;
    if (catatan !== undefined) updateData.catatan = catatan;

    const [row] = await db.update(violationsTable).set(updateData).where(eq(violationsTable.id, id)).returning();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/violations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(violationsTable).where(eq(violationsTable.id, id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete violation");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
