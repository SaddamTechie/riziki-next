"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SignUpForm = dynamic(() => import("./sign-up-form"), { ssr: false });

export default function SignUpLoader() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
