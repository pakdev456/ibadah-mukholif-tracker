import React, { useState } from "react";
import { useParams } from "wouter";
import { 
  useGetStudentViolations, 
  useDeleteViolation, 
  getGetStudentViolationsQueryKey,
  useUpdateViolation
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DetailMukholif() {
  const params = useParams();
  const studentName = decodeURIComponent(params.studentName || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: violations, isLoading } = useGetStudentViolations(studentName, {
    query: {
      enabled: !!studentName,
      queryKey: getGetStudentViolationsQueryKey(studentName)
    }
  });

  const deleteMutation = useDeleteViolation({
    mutation: {
      onSuccess: () => {
        toast({ title: "Terhapus", description: "Pelanggaran berhasil dihapus." });
        queryClient.invalidateQueries({ queryKey: getGetStudentViolationsQueryKey(studentName) });
      }
    }
  });

  const updateMutation = useUpdateViolation({
    mutation: {
      onSuccess: () => {
        toast({ title: "Tersimpan", description: "Pelanggaran berhasil diupdate." });
        queryClient.invalidateQueries({ queryKey: getGetStudentViolationsQueryKey(studentName) });
        setEditData(null);
      }
    }
  });

  const [editData, setEditData] = useState<any>(null);

  const handleDelete = (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus catatan pelanggaran ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleUpdate = () => {
    if (!editData) return;
    updateMutation.mutate({
      id: editData.id,
      data: {
        waktu: editData.waktu,
        jenisPelanggaran: editData.jenisPelanggaran,
        catatan: editData.catatan,
      }
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground font-mono animate-pulse">Memuat riwayat pelanggaran...</div>;
  }

  const studentInfo = violations && violations.length > 0 ? violations[0] : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">{studentName}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
              {studentInfo ? `${studentInfo.kelas} • ${studentInfo.asrama}` : "Data tidak tersedia"}
            </p>
          </div>
        </div>
        <div className="bg-white text-black px-4 py-2 font-mono font-bold text-lg rounded-none border border-white/20">
          TOTAL: {violations?.length || 0}
        </div>
      </div>

      <div className="border border-border bg-card">
        {violations?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono">Belum ada riwayat pelanggaran.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-48">Waktu</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Jenis Pelanggaran</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Catatan</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations?.map((v) => (
                <TableRow key={v.id} className="border-border group hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-sm">
                    {format(new Date(v.waktu), "dd MMM yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{v.jenisPelanggaran}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.catatan || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-white/10" onClick={() => setEditData(v)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground text-muted-foreground" onClick={() => handleDelete(v.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
        <DialogContent className="rounded-none border-border bg-black text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest font-mono">Edit Pelanggaran</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Waktu</label>
                <Input 
                  type="datetime-local" 
                  value={editData.waktu.substring(0, 16)} 
                  onChange={(e) => setEditData({ ...editData, waktu: e.target.value })}
                  className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Jenis Pelanggaran</label>
                <Input 
                  value={editData.jenisPelanggaran} 
                  onChange={(e) => setEditData({ ...editData, jenisPelanggaran: e.target.value })}
                  className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Catatan</label>
                <Textarea 
                  value={editData.catatan || ""} 
                  onChange={(e) => setEditData({ ...editData, catatan: e.target.value })}
                  className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white"
                />
              </div>
              <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
                className="w-full rounded-none h-10 uppercase tracking-widest font-mono text-xs font-bold bg-white text-black hover:bg-gray-200 mt-4"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
