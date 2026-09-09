import { Input } from "@/components/ui/input";

export function StepOne({ register, errors }) {
  return (
    <div>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email address"
        {...register("email")}
        className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
          errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
      )}
    </div>
  );
}