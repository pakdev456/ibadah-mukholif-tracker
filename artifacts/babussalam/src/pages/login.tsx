import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export default function Login() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        checkAuth();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.error || "Invalid credentials",
        });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values });
  };

  return (
    <div className="fixed inset-0 flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 border-r border-border relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black/90"></div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white mb-6 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center">
            <span className="text-black font-mono font-bold text-xl">B</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight uppercase leading-tight max-w-lg">
            Sistem Pendataan<br/>Mukholif Divisi Ibadah
          </h1>
        </div>
        
        <div className="relative z-10 text-white/50 text-sm font-mono tracking-widest uppercase">
          Pondok Pesantren Babussalam • 2026
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card relative">
        <div className="absolute top-0 right-0 p-8 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Secure Access
        </div>
        
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight uppercase">Authorisasi</h2>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">
              Masukkan kredensial anda.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ID Petugas" 
                        {...field} 
                        className="rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-12 px-4 font-mono text-sm transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono tracking-widest">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          className="rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-white h-12 px-4 font-mono text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full rounded-none h-12 uppercase tracking-widest font-mono text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Authenticating..." : "Masuk"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
