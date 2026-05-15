import { Router } from "express";
import { db, violationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals] = await db
      .select({
        totalViolations: sql<number>`cast(count(*) as int)`,
        totalMukholif: sql<number>`cast(count(distinct ${violationsTable.studentName}) as int)`,
        totalKelas: sql<number>`cast(count(distinct ${violationsTable.kelas}) as int)`,
        totalAsrama: sql<number>`cast(count(distinct ${violationsTable.asrama}) as int)`,
        violationsToday: sql<number>`cast(sum(case when ${violationsTable.createdAt} >= ${todayStart.toISOString()} then 1 else 0 end) as int)`,
        violationsThisWeek: sql<number>`cast(sum(case when ${violationsTable.createdAt} >= ${weekStart.toISOString()} then 1 else 0 end) as int)`,
        violationsThisMonth: sql<number>`cast(sum(case when ${violationsTable.createdAt} >= ${monthStart.toISOString()} then 1 else 0 end) as int)`,
      })
      .from(violationsTable);

    res.json({
      totalViolations: totals?.totalViolations ?? 0,
      totalMukholif: totals?.totalMukholif ?? 0,
      totalKelas: totals?.totalKelas ?? 0,
      totalAsrama: totals?.totalAsrama ?? 0,
      violationsToday: totals?.violationsToday ?? 0,
      violationsThisWeek: totals?.violationsThisWeek ?? 0,
      violationsThisMonth: totals?.violationsThisMonth ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-violators", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const rows = await db
      .select({
        studentName: violationsTable.studentName,
        kelas: violationsTable.kelas,
        asrama: violationsTable.asrama,
        violationCount: sql<number>`cast(count(*) as int)`,
      })
      .from(violationsTable)
      .groupBy(violationsTable.studentName, violationsTable.kelas, violationsTable.asrama)
      .orderBy(sql`count(*) desc`)
      .limit(limit);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get top violators");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/violations-by-type", async (req, res) => {
  try {
    const rows = await db
      .select({
        jenisPelanggaran: violationsTable.jenisPelanggaran,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(violationsTable)
      .groupBy(violationsTable.jenisPelanggaran)
      .orderBy(sql`count(*) desc`);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get violations by type");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/violations-by-class", async (req, res) => {
  try {
    const rows = await db
      .select({
        kelas: violationsTable.kelas,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(violationsTable)
      .groupBy(violationsTable.kelas)
      .orderBy(sql`count(*) desc`);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get violations by class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-violations", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const rows = await db
      .select()
      .from(violationsTable)
      .orderBy(sql`${violationsTable.createdAt} desc`)
      .limit(limit);

    res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent violations");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
