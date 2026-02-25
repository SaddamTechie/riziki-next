import SignInLoader from "./sign-in-loader";

export const metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInLoader />;
}
