import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtSign, Key, User, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SiGoogle } from "react-icons/si";
import { signInWithGoogle, getGoogleAuthResult } from "@/lib/firebase";

// Extend the insertUserSchema to add validation rules
const loginSchema = z.object({
  username: z.string().email("Invalid email address").endsWith("@iith.ac.in", "Email must be from the IITH domain"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().email("Invalid email address").endsWith("@iith.ac.in", "Email must be from the IITH domain"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation } = useAuth();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      department: "",
    },
  });

  // Check for Firebase redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setIsProcessingRedirect(true);
        const result = await getGoogleAuthResult();
        if (result && result.user) {
          const { email, displayName } = result.user;
          
          if (email) {
            // Login with the Firebase credentials
            loginMutation.mutate({
              username: email,
              password: "firebase-auth" // Special password that server recognizes as Firebase auth
            });
          }
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    checkRedirectResult();
  }, [loginMutation]);

  // Submit handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  // Handle Google Sign In click
  const handleGoogleSignIn = async () => {
    try {
      setIsProcessingRedirect(true);
      await signInWithGoogle(); // This will redirect to Google
    } catch (error) {
      console.error("Failed to initiate Google sign-in:", error);
      // Error is already handled in the signInWithGoogle function with alert
      setIsProcessingRedirect(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">IITH Room Booking</CardTitle>
        <CardDescription className="text-center">
          Access the room booking system with your IITH credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <div className="mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isProcessingRedirect}
                >
                  <SiGoogle className="h-4 w-4" />
                  <span>{isProcessingRedirect ? "Processing..." : "Sign in with Google"}</span>
                </Button>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
              
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" placeholder="your.email@iith.ac.in" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" type="password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <div className="mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isProcessingRedirect}
                >
                  <SiGoogle className="h-4 w-4" />
                  <span>{isProcessingRedirect ? "Processing..." : "Continue with Google"}</span>
                </Button>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Or register with email
                  </span>
                </div>
              </div>
              
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" placeholder="your.email@iith.ac.in" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" placeholder="John Doe" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" placeholder="Computer Science" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <Input className="pl-10" type="password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Only users with @iith.ac.in email addresses can register
      </CardFooter>
    </Card>
  );
}
