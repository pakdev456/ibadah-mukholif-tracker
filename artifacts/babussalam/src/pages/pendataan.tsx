import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateViolation, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const violationSchema = z.object({
  studentName: z.string().min(1, "Nama wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  jenisPelanggaran: z.string().min(1, "Jenis pelanggaran wajib diisi"),
  catatan: z.string().optional(),
});

export default function Pendataan() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof violationSchema>>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      studentName: "",
      kelas: "",
      jenisPelanggaran: "",
      catatan: "",
    },
  });

  const createMutation = useCreateViolation({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Pelanggaran berhasil dicatat",
          description: `${data.studentName} telah tercatat melakukan pelanggaran.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        form.reset({
          studentName: "",
          kelas: "",
          jenisPelanggaran: "",
          catatan: "",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Gagal mencatat",
          description: error?.error || "Terjadi kesalahan",
        });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof violationSchema>) => {
    createMutation.mutate({
      data: {
        ...values,
        asrama: "",
        waktu: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Pendataan Mukholif</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mt-1">Input Data Pelanggaran Baru</p>
      </div>

      <Card className="rounded-none border-border bg-card">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-mono tracking-widest">Nama Santri</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-mono tracking-widest">Kelas</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: X IPA 1" {...field} className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jenisPelanggaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Jenis Pelanggaran</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Terlambat sholat jamaah" {...field} className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="catatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Catatan Tambahan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail kejadian..."
                        {...field}
                        className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-none h-12 uppercase tracking-widest font-mono text-sm font-bold bg-white text-black hover:bg-gray-200"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Menyimpan..." : "Simpan Pelanggaran"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
