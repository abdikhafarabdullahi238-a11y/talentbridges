import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "./shell";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
export function AuthPage({
  signup = false,
  initialRole = "professional",
}: {
  signup?: boolean;
  initialRole?: string;
}) {
  const [role, setRole] = useState(initialRole);
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState("");
  const { data: user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setConfirmation(true);
      } else if (signup) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.get("name"), role },
          },
        });
        if (error) throw error;
        if (data.session) await navigate({ to: "/dashboard" });
        else setConfirmation(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) toast.error(result.error.message);
    else if (!result.redirected) navigate({ to: "/dashboard" });
  }
  return (
    <>
      <PublicHeader />
      <main className="auth-page">
        <section className="auth-story">
          <span className="mb-7 text-xs font-medium text-teal-light">
            YOUR SKILLS DESERVE AN OPPORTUNITY
          </span>
          <h1 className="text-4xl leading-tight">
            Your next chapter
            <br />
            starts with you.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-on-dark/75">
            Connect with people who see your potential. Gain experience that makes a difference.
            Build a future on your own terms.
          </p>
          <div className="mt-10 space-y-5">
            {[
              "Meaningful professional connections",
              "Practical experience and real opportunities",
              "Your profile. Your privacy. Your choice.",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-teal-light" size={20} />
                {t}
              </div>
            ))}
          </div>
          <p className="mt-20 flex items-center gap-2 text-xs text-on-dark/60">
            <ShieldCheck size={17} /> Inclusive by design. Skills first, always.
          </p>
        </section>
        <section className="auth-form">
          {confirmation ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-5 text-primary" size={40} />
              <h2 className="text-2xl">Check your email</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {forgot
                  ? "Follow the secure link to set a new password."
                  : "Confirm your email address to activate your TalentBridge account. Your profile will be ready when you return."}
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/auth">Back to login</Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl">
                {forgot ? "Reset your password" : signup ? "Make your next move" : "Welcome back"}
              </h2>
              <p className="mb-7 mt-2 text-sm text-muted-foreground">
                {forgot
                  ? "We’ll email you a secure reset link."
                  : signup
                    ? "Join a community built around your potential."
                    : "Your next opportunity is waiting."}
              </p>
              {!forgot && !signup && (
                <div className="mb-5 space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => social("google")}>
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => social("lovable")}>
                    <LovableMark />
                    Continue with Lovable
                  </Button>
                  <p className="py-2 text-center text-[11px] text-muted-foreground">
                    or continue with email
                  </p>
                </div>
              )}
              <form onSubmit={submit} className="space-y-5">
                {signup && (
                  <>
                    <label className="field">
                      I’m here as
                      <select
                        aria-label="Account role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="professional">A professional / job seeker</option>
                        <option value="mentor">A professional mentor</option>
                        <option value="employer">An employer / organization</option>
                      </select>
                    </label>
                    <label className="field">
                      Full name
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Your full name"
                      />
                    </label>
                  </>
                )}
                <label className="field">
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
                {!forgot && (
                  <label className="field">
                    Password
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete={signup ? "new-password" : "current-password"}
                      placeholder={signup ? "At least 8 characters" : "Enter your password"}
                    />
                  </label>
                )}
                {error && (
                  <p role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                )}
                {!signup && !forgot && (
                  <Button
                    variant="link"
                    type="button"
                    className="h-auto p-0 text-xs"
                    onClick={() => setForgot(true)}
                  >
                    Forgot password?
                  </Button>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : forgot
                      ? "Send reset link"
                      : signup
                        ? "Create my account"
                        : "Log in"}
                  <ArrowRight />
                </Button>
                {signup && (
                  <p className="text-center text-[10px] leading-5 text-muted-foreground">
                    By joining, you agree to our skills-first community principles.
                    <br />
                    <Link to="/privacy" className="text-primary">
                      Read our privacy & inclusion policy
                    </Link>
                  </p>
                )}
              </form>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {signup ? "Already part of TalentBridge?" : "New to TalentBridge?"}{" "}
                <Link to={signup ? "/auth" : "/signup"} className="font-semibold text-primary">
                  {signup ? "Log in" : "Join the community"}
                </Link>
              </p>
            </>
          )}
        </section>
      </main>
    </>
  );
}
