import { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error("That email and password didn't match. Check them and try again.");
      } else {
        if (code.trim() !== (import.meta.env.VITE_FAMILY_INVITE_CODE || "")) {
          throw new Error("That family code isn't right. Ask Gavin for it.");
        }
        if (!name.trim()) throw new Error("Add your name so the family knows who you are.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("That email already has an account. Sign in instead.");
        }
        if (data.session) {
          await supabase.from("profiles").upsert({ id: data.user.id, display_name: name.trim() });
        } else {
          setMessage("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const registering = mode === "register";

  return (
    <main className="auth">
      <form className="panel auth-card" onSubmit={submit}>
        <img className="auth-icon" src="/icons/icon-192.png" alt="" width="72" height="72" />
        <h1>Spavins Planner</h1>
        <p className="muted">
          {registering
            ? "Create an account with the family code."
            : "Sign in with the same email and password you use for the Spavins Calendar."}
        </p>

        {registering && (
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={registering ? "new-password" : "current-password"}
            minLength={6}
            required
          />
        </label>
        {registering && (
          <label className="field">
            <span>Family code</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
          </label>
        )}

        {message && <p className="form-message" role="alert">{message}</p>}

        <button className="btn btn-primary btn-wide" type="submit" disabled={busy}>
          {busy ? "One moment…" : registering ? "Create account" : "Sign in"}
        </button>
        <button
          className="btn btn-quiet btn-wide"
          type="button"
          onClick={() => {
            setMode(registering ? "signin" : "register");
            setMessage("");
          }}
        >
          {registering ? "I already have an account" : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}
