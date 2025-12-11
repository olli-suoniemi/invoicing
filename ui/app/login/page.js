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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test@gmail.com");
  const [err, setErr] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      // 1) Firebase login
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken(true);

      // 2) Call backend via Next API to upsert user
      const upsert = await fetch("/api/auth/login/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          email,
        }),
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
        // in prod over https you *should* add "secure"
        window.location.protocol === "https:" ? "secure" : "",
      ]
        .filter(Boolean)
        .join("; ");

      // 4) Redirect
      router.push(redirect);
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-md shadow-md">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
        <div className="join w-full">
          <span className="join-item px-3 text-gray-500 flex items-center">
            <MdEmail size={18} />
          </span>
          <input
            type="email"
            className="input input-bordered join-item w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="join w-full">
          <span className="join-item px-3 text-gray-500 flex items-center">
            <FaLock size={18} />
          </span>
          <input
            type="password"
            className="input input-bordered join-item w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">
          Sign in
        </button>
      </form>
      {err && <p className="text-red-500 mt-4">{err}</p>}
    </div>
  );
}
