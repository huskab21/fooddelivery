"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

// Нууц үгийн талбар + баруун талд харуулах/нуух товч.
// Талбар бүр өөрийн state-тэй тул тус тусад нь нээж/хааж болно.
function PasswordInput({ id, placeholder, registration, error, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registration}
          className={`w-full py-6 pr-12 text-base rounded-xl border-slate-300 focus-visible:ring-slate-400 ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
        />
        <button
          type="button" // form submit хийхгүйн тулд заавал type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export function StepTwo({ register, errors }) {
  return (
    <div className="space-y-4">
      <PasswordInput
        id="password"
        placeholder="Password"
        autoComplete="new-password"
        registration={register("password")}
        error={errors.password}
      />

      <PasswordInput
        id="confirmPassword"
        placeholder="Confirm password"
        autoComplete="new-password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
      />
    </div>
  );
}