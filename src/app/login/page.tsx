"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn("email", {
        email,
        redirect: true,
        callbackUrl: "/buyers",
      });
      if (result && (result as any).error) {
        setError((result as any).error as string);
      }
    } catch (err) {
      setError("Failed to initiate sign-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email to receive a secure sign-in link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="you@example.com"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full rounded-md bg-black text-white py-2 disabled:opacity-50"
          >
            {isSubmitting ? "Sending magic link..." : "Send magic link"}
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500">
          By continuing, you agree to the Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}


