"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,           // Input-үүдээ бүртгэх
    trigger,            // Дундын алхам дээр албаар шалгах (Next дарах үед)
    handleSubmit,       // Форм илгээх
    formState: { errors }, // Алдаанууд энд автоматаар хадгалагдана
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // 1-р алхмаас "Next" дарах үед
  const handleNext = async () => {
    // Зөвхөн "email" талбарыг л шалгах (trigger)
    const isEmailValid = await trigger("email");
    if (isEmailValid) {
      setStep(2); // Алдаагүй бол дараагийн алхам руу
    }
  };

  // 2-р алхамд "Sign Up" дарах үед
  const onSubmit = (data) => {
    // Энд ирж байгаа data нь автоматаар шалгагдсан, ямар ч алдаагүй, бэлэн өгөгдөл байна.
    console.log("Signup Data:", data);
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          {step === 1 ? (
            <Link
              href="/"
              className="mb-10 flex items-center justify-center w-10 h-10 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </Link>
          ) : (
            <button
              onClick={() => setStep(1)}
              type="button"
              className="mb-10 flex items-center justify-center w-10 h-10 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}

          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Sign up</h1>
          <p className="text-slate-500 mb-10 text-lg">
            Create an account to enjoy your favourite dishes.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email")} /* ҮНДСЭН ӨӨРЧЛӨЛТ: onChange, value бичих шаардлагагүй */
                  className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")} /* ҮНДСЭН ӨӨРЧЛӨЛТ: onChange, value бичих шаардлагагүй */
                  className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
                    errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-password"
                    checked={showPassword}
                    onCheckedChange={(checked) => setShowPassword(checked)}
                  />
                  <label
                    htmlFor="show-password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show password
                  </label>
                </div>
              </div>
            )}

            {/* Товчлуур хэсэг */}
            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNext} // 1-р алхамд бол Next функцийг дуудна
                className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit" // 2-р алхамд бол хэвийн Submit хийгдэнэ
                className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
              >
                Sign Up
              </Button>
            )}
          </form>

          {/* ... Доод талын Нэвтрэх хэсэг болон Зураг өмнөхтэйгээ адилхан байна ... */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-700 hover:underline">
                Log in
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