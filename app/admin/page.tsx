"use client";

import Link from "next/link";
import React from "react";

export default function FakeAdminPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md space-y-4">
        <h1 className="text-6xl font-black text-slate-400 dark:text-slate-600">404</h1>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested URL <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">/admin</code> was not found on this server. That’s all we know.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
