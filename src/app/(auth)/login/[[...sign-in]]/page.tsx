"use client"

import { APP_NAME } from "@/lib/constants";
import SignInForm from "@/components/auth/SignInForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{APP_NAME}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account to manage your listings
          </p>
        </div>

        <div className="flex justify-center">
          <SignInForm />
        </div>
      </div>
    </div>
  );
} 