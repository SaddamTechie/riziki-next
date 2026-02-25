import SignUpLoader from "./sign-up-loader";

export const metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpLoader />;
}
