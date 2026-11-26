import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PublicShell } from "@/components/talentbridge/shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Reset password", "Securely set a new TalentBridge password."),
  component: Reset,
});
function Reset() {
  const [recovery, setRecovery] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setRecovery(window.location.hash.includes("type=recovery"));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords must match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: String(form.get("password")) });
    if (error) setError(error.message);
    else setDone(true);
  }
  return (
    <PublicShell>
      <main className="auth-form min-h-96">
        <h1 className="text-2xl">{done ? "Password updated" : "Set your new password"}</h1>
        {done ? (
          <Button asChild className="mt-6">
            <Link to="/dashboard">Go to my workspace</Link>
          </Button>
        ) : recovery ? (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="field">
              New password
              <input name="password" type="password" required minLength={8} />
            </label>
            <label className="field">
              Confirm password
              <input name="confirm" type="password" required minLength={8} />
            </label>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <Button type="submit">Update password</Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Open the recovery link from your email to reset your password.
          </p>
        )}
      </main>
    </PublicShell>
  );
}
