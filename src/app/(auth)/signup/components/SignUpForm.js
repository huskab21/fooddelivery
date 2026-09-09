"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signupSchema } from "../features/signup-schema";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { server } from "@/app/_api/api";
import { useRouter } from "next/navigation";

export function SignupForm({ step, setStep }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const handleNext = async () => {
    const isEmailValid = await trigger("email");
    if (isEmailValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await server.post("/auth/sign-up", {
        email: data.email,
        password: data.password,
      });
      console.log(response);
      console.log(data.email);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && <StepOne register={register} errors={errors} />}

      {step === 2 && (
        <StepTwo
          register={register}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}

      {step === 1 ? (
        <Button
          type="button"
          onClick={handleNext}
          className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
        >
          Sign Up
        </Button>
      )}
    </form>
  );
}
