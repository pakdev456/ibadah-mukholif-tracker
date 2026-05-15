import React, { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";

export default function DaftarMukholif() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: students, isLoading } = useListStudents({
    search: debouncedSearch,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Daftar Mukholif</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mt-1">Database Santri Pelanggar</p>
        </div>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Cari nama santri..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
          />
        </div>
      </div>

      <div className="border border-border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground font-mono">Memuat data...</div>
        ) : students?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono">Tidak ada data ditemukan.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Nama Mukholif</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Kelas</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Asrama</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Total Pelanggaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student) => (
                <TableRow key={student.studentName} className="border-border hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium">
                    <Link href={`/mukholif/${encodeURIComponent(student.studentName)}`} className="hover:underline">
                      {student.studentName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.kelas}</TableCell>
                  <TableCell className="font-mono text-sm">{student.asrama}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">{student.violationCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
