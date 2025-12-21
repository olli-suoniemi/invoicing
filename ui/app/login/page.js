// app/login/page.js
"use client";

import { useState, Suspense } from "react";
import { auth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!auth) {
      setErr("Auth not initialized – check Firebase config.");
      return;
    }

    if (!email.trim() || !password) {
      setErr("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) Firebase login
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken(true);

      // 2) Call backend via Next API to upsert user
      const upsert = await fetch("/api/auth/login/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, email: email.trim() }),
      });

      if (!upsert.ok) {
        const { error } = await upsert.json().catch(() => ({}));
        throw new Error(error || "Failed to create user");
      }

      // 3) Store the ID token in a cookie for middleware
      const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
      document.cookie = [
        `session=${idToken}`,
        "path=/",
        `max-age=${maxAgeSeconds}`,
        "samesite=lax",
        window.location.protocol === "https:" ? "secure" : "",
      ]
        .filter(Boolean)
        .join("; ");

      // 4) Redirect
      router.push(redirect);
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 flex items-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="rounded-xl border border-base-300 bg-base-100 p-5 sm:p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="text-sm opacity-70 mt-1">
              Enter your email and password to access your account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Email</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <MdEmail size={18} />
                </span>
              </div>
              <input
                type="email"
                className="input input-bordered w-full h-12 md:h-11"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="form-control">
              <div className="label py-1">
                <span className="label-text">Password</span>
                <span className="label-text-alt text-base-content/60 flex items-center">
                  <FaLock size={16} />
                </span>
              </div>
              <input
                type="password"
                className="input input-bordered w-full h-12 md:h-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              className={`btn btn-primary w-full ${submitting ? "btn-disabled opacity-70" : ""}`}
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {err && (
            <div className="alert alert-error mt-4">
              <span>{err}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
