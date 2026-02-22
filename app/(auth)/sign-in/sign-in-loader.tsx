"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SignInForm = dynamic(() => import("./sign-in-form"), { ssr: false });

export default function SignInLoader() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
