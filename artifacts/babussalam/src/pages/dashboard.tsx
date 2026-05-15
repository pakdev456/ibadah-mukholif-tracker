import React from "react";
import { 
  useGetDashboardStats, 
  useGetTopViolators, 
  useGetViolationsByType, 
  useGetViolationsByClass, 
  useGetRecentViolations 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topViolators, isLoading: topLoading } = useGetTopViolators({ limit: 10 });
  const { data: recentViolations, isLoading: recentLoading } = useGetRecentViolations({ limit: 10 });
  const { data: violationsByType, isLoading: typesLoading } = useGetViolationsByType();
  const { data: violationsByClass, isLoading: classesLoading } = useGetViolationsByClass();

  if (statsLoading || topLoading || recentLoading || typesLoading || classesLoading) {
    return <div className="text-muted-foreground font-mono animate-pulse">Loading dashboard data...</div>;
  }

  // Pure B&W palette for pie charts
  const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#1a1a1a'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mt-1">Ringkasan Data Pelanggaran</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Mukholif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.totalMukholif || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Pelanggaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.totalViolations || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.violationsToday || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.violationsThisMonth || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wider">Statistik Kelas</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-widest">Sebaran pelanggaran per kelas</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationsByClass || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="kelas" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 0, fontFamily: 'monospace', fontSize: '12px' }}
                  cursor={{ fill: '#222' }}
                />
                <Bar dataKey="count" fill="#fff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wider">Jenis Pelanggaran</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-widest">Sebaran jenis pelanggaran</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationsByType || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="jenisPelanggaran"
                >
                  {(violationsByType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 0, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wider">Top 10 Mukholif</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-widest">Siswa dengan pelanggaran terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Nama</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Kelas</TableHead>
                  <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topViolators?.map((v) => (
                  <TableRow key={v.studentName} className="border-border">
                    <TableCell className="font-medium">
                      <Link href={`/mukholif/${encodeURIComponent(v.studentName)}`} className="hover:underline">
                        {v.studentName}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{v.kelas}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{v.violationCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wider">Pelanggaran Terakhir</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-widest">Aktivitas pencatatan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentViolations?.map((v) => (
                <div key={v.id} className="flex flex-col space-y-1 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <Link href={`/mukholif/${encodeURIComponent(v.studentName)}`} className="font-medium hover:underline">
                      {v.studentName}
                    </Link>
                    <span className="text-xs font-mono text-muted-foreground">
                      {format(new Date(v.waktu), "dd MMM yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="text-sm">{v.jenisPelanggaran}</div>
                  <div className="text-xs font-mono text-muted-foreground">{v.kelas} - {v.asrama}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
