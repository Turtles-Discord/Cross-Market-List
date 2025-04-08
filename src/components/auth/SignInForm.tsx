"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignInForm() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <SignIn
      appearance={{
        baseTheme: isDark ? dark : undefined,
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          footerActionLink: "text-blue-600 hover:text-blue-700",
          card: "bg-white dark:bg-gray-800 shadow-md rounded-lg",
        },
      }}
      redirectUrl="/dashboard"
      routing="hash"
    />
  );
} 