"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signupSchema } from "../features/signup-schema";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { useAuth } from "@/app/(provider)/authprovider";

export function SignupForm({ step, setStep }) {
  const { signup } = useAuth();

  const {
    register,
    trigger,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit", // эхний удаа зөвхөн Sign Up дарахад шалгана
    reValidateMode: "onChange", // алдаа гарсны дараа бичих явцад шинэчлэгдэнэ
  });

  const handleNext = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;
    // Step 2 цэвэрхэн эхэлнэ — урьд нь гарсан password алдааг арилгана
    clearErrors(["password", "confirmPassword", "root"]);
    setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      // Амжилттай бол authprovider өөрөө зөв хуудас руу шилжүүлнэ
      await signup(data.email, data.password);
    } catch (err) {
      setError("root", {
        message: err.message || "Бүртгүүлэхэд алдаа гарлаа",
      });
    }
  };

  // Step 1 дээр Enter дарахад бүх form-ыг submit хийхгүй, зөвхөн Next шиг ажиллана
  const handleFormSubmit = (e) => {
    if (step === 1) {
      e.preventDefault();
      handleNext();
      return;
    }
    handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
      {step === 1 && <StepOne register={register} errors={errors} />}

      {step === 2 && <StepTwo register={register} errors={errors} />}

      {errors.root && (
        <p className="text-red-500 text-sm">{errors.root.message}</p>
      )}

      {/* key өгснөөр React хоёр товчийг өөр DOM element болгож,
          Next дарахад submit товч болж хувираад form илгээгдэхээс сэргийлнэ */}
      {step === 1 ? (
        <Button
          key="next"
          type="button"
          onClick={handleNext}
          className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors"
        >
          Next
        </Button>
      ) : (
        <Button
          key="submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 text-base font-semibold rounded-xl bg-[#18181B] text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Loading..." : "Sign Up"}
        </Button>
      )}
    </form>
  );
}