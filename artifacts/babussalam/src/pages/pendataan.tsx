import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const KELAS_OPTIONS = ["7", "8", "9", "10", "11"];

const JENIS_PRESET = ["Mashol", "Masbuk"];
const JENIS_LAIN = "__lain__";

const violationSchema = z.object({
  studentName: z.string().min(1, "Nama wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  jenisPelanggaranSelect: z.string().min(1, "Jenis pelanggaran wajib dipilih"),
  jenisPelanggaranCustom: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
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
      jenisPelanggaranSelect: "",
      jenisPelanggaranCustom: "",
      tanggal: format(new Date(), "yyyy-MM-dd"),
      catatan: "",
    },
  });

  const selectedJenis = form.watch("jenisPelanggaranSelect");

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
          jenisPelanggaranSelect: "",
          jenisPelanggaranCustom: "",
          tanggal: format(new Date(), "yyyy-MM-dd"),
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
    const jenisPelanggaran =
      values.jenisPelanggaranSelect === JENIS_LAIN
        ? (values.jenisPelanggaranCustom || "").trim()
        : values.jenisPelanggaranSelect;

    if (!jenisPelanggaran) {
      form.setError("jenisPelanggaranCustom", { message: "Jenis pelanggaran wajib diisi" });
      return;
    }

    createMutation.mutate({
      data: {
        studentName: values.studentName,
        kelas: `Kelas ${values.kelas}`,
        asrama: "",
        waktu: values.tanggal,
        jenisPelanggaran,
        catatan: values.catatan,
      }
    });
  };

  const formattedDate = (() => {
    const tanggal = form.watch("tanggal");
    if (!tanggal) return "";
    try {
      return format(new Date(tanggal + "T00:00:00"), "EEEE, dd MMMM yyyy", { locale: localeId });
    } catch {
      return "";
    }
  })();

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

              {/* Tanggal */}
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Tanggal Kejadian</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
                      />
                    </FormControl>
                    {formattedDate && (
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest pt-1">
                        {formattedDate}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Santri */}
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-mono tracking-widest">Nama Santri</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama lengkap"
                          {...field}
                          className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kelas */}
                <FormField
                  control={form.control}
                  name="kelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-mono tracking-widest">Kelas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none font-mono text-sm border-border bg-transparent focus:ring-1 focus:ring-white h-10">
                            <SelectValue placeholder="Pilih kelas..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none border-border bg-black">
                          {KELAS_OPTIONS.map((k) => (
                            <SelectItem
                              key={k}
                              value={k}
                              className="font-mono text-sm focus:bg-white focus:text-black"
                            >
                              Kelas {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Jenis Pelanggaran */}
              <FormField
                control={form.control}
                name="jenisPelanggaranSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Jenis Pelanggaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none font-mono text-sm border-border bg-transparent focus:ring-1 focus:ring-white h-10">
                          <SelectValue placeholder="Pilih jenis pelanggaran..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-border bg-black">
                        {JENIS_PRESET.map((j) => (
                          <SelectItem
                            key={j}
                            value={j}
                            className="font-mono text-sm focus:bg-white focus:text-black"
                          >
                            {j}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value={JENIS_LAIN}
                          className="font-mono text-sm text-muted-foreground focus:bg-white focus:text-black border-t border-border mt-1 pt-1"
                        >
                          Jenis yang lain...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom jenis pelanggaran — muncul jika pilih "Jenis yang lain" */}
              {selectedJenis === JENIS_LAIN && (
                <FormField
                  control={form.control}
                  name="jenisPelanggaranCustom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-mono tracking-widest">Tulis Jenis Pelanggaran</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Terlambat sholat jamaah"
                          {...field}
                          autoFocus
                          className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Catatan */}
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
                        className="rounded-none font-mono text-sm border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white min-h-[80px]"
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
