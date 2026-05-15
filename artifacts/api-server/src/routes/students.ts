import { Router } from "express";
import { db, violationsTable } from "@workspace/db";
import { sql, eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

router.get("/students", async (req, res) => {
  try {
    const { search, kelas, asrama } = req.query as Record<string, string | undefined>;

    const conditions: SQL[] = [];
    if (search) conditions.push(ilike(violationsTable.studentName, `%${search}%`));
    if (kelas) conditions.push(eq(violationsTable.kelas, kelas));
    if (asrama) conditions.push(eq(violationsTable.asrama, asrama));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        studentName: violationsTable.studentName,
        kelas: violationsTable.kelas,
        asrama: violationsTable.asrama,
        violationCount: sql<number>`cast(count(*) as int)`,
        lastViolation: sql<string>`max(${violationsTable.createdAt})`,
      })
      .from(violationsTable)
      .where(whereClause)
      .groupBy(violationsTable.studentName, violationsTable.kelas, violationsTable.asrama)
      .orderBy(sql`count(*) desc`);

    res.json(rows.map(r => ({
      ...r,
      lastViolation: r.lastViolation ? new Date(r.lastViolation).toISOString() : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list students");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:studentName/violations", async (req, res) => {
  try {
    const { studentName } = req.params;
    const rows = await db
      .select()
      .from(violationsTable)
      .where(eq(violationsTable.studentName, decodeURIComponent(studentName)))
      .orderBy(violationsTable.createdAt);

    res.json(rows.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get student violations");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
