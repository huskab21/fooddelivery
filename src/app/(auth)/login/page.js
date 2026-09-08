"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" }) 
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" }) 
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one special character (e.g. !@#$%^&*)",
    }),
});

export default function LoginPage() {
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });


  const onSubmit = (data) => {
    // Энд Zod-оор шалгагдсан, алдаагүй, бэлэн дата орж ирнэ
    console.log("Login Data:", data);
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link
            href="/"
            className="mb-10 flex items-center justify-center w-10 h-10 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </Link>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Log in
          </h1>
          <p className="text-slate-500 mb-10 text-lg">
            Log in to enjoy your favourite dishes.
          </p>

          {/* onSubmit хэсэгт handleSubmit(onSubmit) гэж дуудна */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register("email")} // value, onChange хэрэггүй болсон
                className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {/* Алдаа гарвал улаанаар харуулах */}
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")} // value, onChange хэрэггүй болсон
                className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {/* Алдаа гарвал улаанаар харуулах */}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <p className="text-lg font-normal tracking-normal align-middle underline underline-offset-0 decoration-solid font-sans cursor-pointer hover:text-slate-700">
              Forgot password?
            </p>

            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
            >
              Let&apos;s Go
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-700 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 h-full p-6">
        <div className="w-full h-full rounded-3xl overflow-hidden relative bg-slate-100">
          <Image
            src="/pictures/delivery.png"
            alt="Delivery person"
            className="object-cover"
            fill
            sizes="50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
