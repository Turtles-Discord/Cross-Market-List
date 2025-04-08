"use client"

import { APP_NAME } from "@/lib/constants";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{APP_NAME}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your account to start managing listings
          </p>
        </div>

        <div className="flex justify-center">
          <SignUpForm />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you get a free plan with up to 25 listings.
            <br />
            Need more? Check out our Pro Plan at any time.
          </p>
        </div>
      </div>
    </div>
  );
} 