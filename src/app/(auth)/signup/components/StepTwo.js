import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function StepTwo({ register, errors, showPassword, setShowPassword }) {
  return (
    <div className="space-y-4">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        {...register("password")}
        className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
          errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      />
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
      )}

      <Input
        id="confirmPassword"
        type={showPassword ? "text" : "password"}
        placeholder="Confirm password"
        {...register("confirmPassword")}
        className={`w-full py-6 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
          errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      />
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
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
  );
}