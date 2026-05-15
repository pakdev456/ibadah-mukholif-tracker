import { useState, useMemo } from "react";
import {
  useListStudents,
  useDeleteStudent,
  getListStudentsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetTopViolatorsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Filter, X } from "lucide-react";

export default function DaftarMukholif() {
  const [search, setSearch] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedAsrama, setSelectedAsrama] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allStudents } = useListStudents(
    {},
    { query: { queryKey: getListStudentsQueryKey({}) } }
  );

  const { data: students, isLoading } = useListStudents(
    {
      search: debouncedSearch || undefined,
      kelas: selectedKelas || undefined,
      asrama: selectedAsrama || undefined,
    },
    {
      query: {
        queryKey: getListStudentsQueryKey({
          search: debouncedSearch || undefined,
          kelas: selectedKelas || undefined,
          asrama: selectedAsrama || undefined,
        }),
      },
    }
  );

  const kelasList = useMemo(() => {
    if (!allStudents) return [];
    return Array.from(new Set(allStudents.map((s) => s.kelas))).sort();
  }, [allStudents]);

  const asramaList = useMemo(() => {
    if (!allStudents) return [];
    return Array.from(new Set(allStudents.map((s) => s.asrama))).sort();
  }, [allStudents]);

  const deleteMutation = useDeleteStudent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTopViolatorsQueryKey({}) });
        toast({
          title: "Mukholif dihapus",
          description: "Semua data pelanggaran mukholif telah dihapus.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Gagal menghapus",
          description: "Terjadi kesalahan saat menghapus data.",
        });
      },
    },
  });

  const hasFilters = selectedKelas || selectedAsrama;

  const clearFilters = () => {
    setSelectedKelas("");
    setSelectedAsrama("");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Daftar Mukholif</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mt-1">
          Database Santri Pelanggar
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <Input
          data-testid="input-search"
          placeholder="Cari nama santri..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10 w-full md:w-64"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

          {/* Kelas Filter */}
          <div className="flex gap-1 flex-wrap">
            <button
              data-testid="filter-kelas-all"
              onClick={() => setSelectedKelas("")}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors ${
                selectedKelas === ""
                  ? "bg-white text-black border-white"
                  : "border-border text-muted-foreground hover:border-white hover:text-white"
              }`}
            >
              Semua Kelas
            </button>
            {kelasList.map((k) => (
              <button
                key={k}
                data-testid={`filter-kelas-${k}`}
                onClick={() => setSelectedKelas(k === selectedKelas ? "" : k)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors ${
                  selectedKelas === k
                    ? "bg-white text-black border-white"
                    : "border-border text-muted-foreground hover:border-white hover:text-white"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Asrama Filter */}
          {asramaList.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground self-center px-1">|</span>
              <button
                data-testid="filter-asrama-all"
                onClick={() => setSelectedAsrama("")}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors ${
                  selectedAsrama === ""
                    ? "bg-white text-black border-white"
                    : "border-border text-muted-foreground hover:border-white hover:text-white"
                }`}
              >
                Semua Asrama
              </button>
              {asramaList.map((a) => (
                <button
                  key={a}
                  data-testid={`filter-asrama-${a}`}
                  onClick={() => setSelectedAsrama(a === selectedAsrama ? "" : a)}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors ${
                    selectedAsrama === a
                      ? "bg-white text-black border-white"
                      : "border-border text-muted-foreground hover:border-white hover:text-white"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {hasFilters && (
            <button
              data-testid="button-clear-filters"
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {students?.length ?? 0} mukholif ditemukan
          {selectedKelas && ` · Kelas ${selectedKelas}`}
          {selectedAsrama && ` · Asrama ${selectedAsrama}`}
        </p>
      )}

      {/* Table */}
      <div className="border border-border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground font-mono">Memuat data...</div>
        ) : students?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono">
            Tidak ada mukholif ditemukan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Nama Mukholif
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Kelas
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Asrama
                </TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Total Pelanggaran
                </TableHead>
                <TableHead className="w-24 font-mono text-xs uppercase tracking-widest text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student) => (
                <TableRow
                  key={student.studentName}
                  data-testid={`row-student-${student.studentName}`}
                  className="border-border hover:bg-white/5 transition-colors"
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/mukholif/${encodeURIComponent(student.studentName)}`}
                      className="hover:underline"
                      data-testid={`link-student-${student.studentName}`}
                    >
                      {student.studentName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.kelas}</TableCell>
                  <TableCell className="font-mono text-sm">{student.asrama}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-bold">
                    {student.violationCount}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-testid={`button-delete-${student.studentName}`}
                          variant="ghost"
                          size="icon"
                          className="rounded-none hover:bg-red-900/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border-border bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="uppercase tracking-tight">
                            Hapus Data Mukholif
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-mono text-sm">
                            Semua {student.violationCount} catatan pelanggaran milik{" "}
                            <span className="text-white font-bold">{student.studentName}</span> akan
                            dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-testid="button-cancel-delete"
                            className="rounded-none border-border font-mono uppercase text-xs tracking-widest"
                          >
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-testid="button-confirm-delete"
                            onClick={() =>
                              deleteMutation.mutate({
                                studentName: encodeURIComponent(student.studentName),
                              })
                            }
                            className="rounded-none bg-white text-black hover:bg-red-500 hover:text-white font-mono uppercase text-xs tracking-widest transition-colors"
                          >
                            Hapus Permanen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
