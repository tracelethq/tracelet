export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  home: "/",
} as const;

export const AUTH_COPY = {
  signIn: {
    title: "Sign in",
    description: "Sign in with your email and password.",
    submit: "Sign in",
    submitting: "Signing in…",
    noAccount: "Don't have an account?",
    link: "Sign up",
  },
  signUp: {
    title: "Create an account",
    description: "Enter your details to get started.",
    submit: "Sign up",
    submitting: "Creating account…",
    hasAccount: "Already have an account?",
    link: "Sign in",
  },
  labels: { email: "Email", password: "Password", name: "Name" },
  placeholders: { email: "you@example.com", password: "••••••••", name: "Your name" },
  errors: { signInFailed: "Sign in failed.", signUpFailed: "Sign up failed." },
} as const;
