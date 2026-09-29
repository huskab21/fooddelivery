"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "../Features/login-schema";
import { useAuth } from "@/app/(provider)/authprovider";

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Амжилттай бол authprovider өөрөө зөв хуудас руу шилжүүлнэ
      await login(data.email, data.password);
    } catch (err) {
      // authprovider fetch ашиглаж throw new Error(...) хийдэг тул err.message-ээс уншина
      setError("root", {
        message: err.message || "Email эсвэл нууц үг буруу байна",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          {/* Нууц үг + харуулах/нуух товч */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              {...register("password")}
              className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button" // form submit хийхгүйн тулд заавал type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
      </div>

      {errors.root && (
        <p className="text-red-500 text-sm">{errors.root.message}</p>
      )}

      <p className="text-lg font-normal underline cursor-pointer hover:text-slate-700">
        Forgot password?
      </p>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Loading..." : "Let's Go"}
      </Button>
    </form>
  );
}