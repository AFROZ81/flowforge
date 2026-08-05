import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "../hooks/useLogin";
import {
    loginSchema,
    type LoginFormValues,
} from "../validation/login.schema";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormValues) {
        try {
            await loginMutation.mutateAsync(data);

            toast.success("Welcome back!");
        } catch {
            toast.error("Invalid email or password.");
        }
    }

    return (
        <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
            <h1 className="text-4xl font-bold tracking-tight">
                Welcome Back
            </h1>

            <p className="mt-2 text-slate-500">
                Sign in to continue to your FlowForge workspace.
            </p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-10 space-y-6"
            >
                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>

                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 rounded-xl pr-10"
                            {...register("password")}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((prev) => !prev)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox id="remember" />

                        <Label htmlFor="remember">
                            Remember me
                        </Label>
                    </div>

                    <button
                        type="button"
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isSubmitting || loginMutation.isPending}
                    className="h-12 w-full rounded-xl text-base"
                >
                    {loginMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    {loginMutation.isPending
                        ? "Signing In..."
                        : "Sign In"}
                </Button>
            </form>

            <div className="mt-10 border-t pt-6">
                <p className="text-center text-sm text-slate-500">
                    Secure • Fast • Real-time Collaboration
                </p>
            </div>
        </Card>
    );
}