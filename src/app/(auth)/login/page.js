import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

import { LoginForm } from "./Components/LoginForm";

export default function LoginPage() {
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

          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Log in</h1>
          <p className="text-slate-500 mb-10 text-lg">
            Log in to enjoy your favourite dishes.
          </p>

          <LoginForm />

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