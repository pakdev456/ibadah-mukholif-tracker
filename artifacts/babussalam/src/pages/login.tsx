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
          <div className="w-14 h-14 bg-white mb-6 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center p-2">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Left minaret */}
              <rect x="7" y="45" width="10" height="50" fill="black"/>
              <polygon points="7,45 12,29 17,45" fill="black"/>
              <circle cx="12" cy="27" r="2.5" fill="black"/>
              {/* Right minaret */}
              <rect x="83" y="45" width="10" height="50" fill="black"/>
              <polygon points="83,45 88,29 93,45" fill="black"/>
              <circle cx="88" cy="27" r="2.5" fill="black"/>
              {/* Main body */}
              <rect x="26" y="62" width="48" height="33" fill="black"/>
              {/* Main dome */}
              <path d="M26,62 Q50,28 74,62Z" fill="black"/>
              {/* Door cutout */}
              <path d="M43,95 L43,74 Q50,65 57,74 L57,95Z" fill="white"/>
              {/* Windows */}
              <circle cx="36" cy="72" r="3.5" fill="white"/>
              <circle cx="64" cy="72" r="3.5" fill="white"/>
              {/* Crescent */}
              <defs>
                <mask id="cres-login">
                  <circle cx="50" cy="30" r="6.5" fill="white"/>
                  <circle cx="53" cy="27.5" r="5" fill="black"/>
                </mask>
              </defs>
              <rect x="43" y="23" width="14" height="14" fill="black" mask="url(#cres-login)"/>
              <circle cx="58.5" cy="23.5" r="1.8" fill="black"/>
            </svg>
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
