"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { customerApi } from "@/api/customerApi";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password should be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await customerApi.auth.resetPassword(token, password);
      toast.success("Password updated successfully.");
      router.push("/auth/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-orange-100 p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-orange-500 uppercase tracking-[0.3em]">EventStan</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-500">Choose a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">Confirm password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      {!token && <p className="mt-4 text-sm text-red-600">The reset link is missing a token.</p>}

      <div className="mt-6 text-center text-sm text-gray-500">
        <Link href="/auth/login" className="font-semibold text-orange-500 hover:text-orange-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 px-4">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
