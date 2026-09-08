"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CmsService } from "@/services/cmsService";
import { CmsLoginView } from "@/components/cms/CmsLoginView";
import { CmsLayout } from "@/components/cms/CmsLayout";
import { ToastContainer, ToastMessage } from "@/components/Toast";

const emptySubscribe = () => () => {};

export default function CmsLoginPage() {
  const router = useRouter();
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return CmsService.isAdminAuthenticated();
    }
    return false;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const newToast: ToastMessage = {
      id: "toast_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (isAuthenticated) {
    return (
      <div className="dark">
        <CmsLayout
          onBackToSite={() => router.push("/")}
          onLogout={() => {
            CmsService.logoutAdmin();
            setIsAuthenticated(false);
            showToast("info", "Logged out of administrator session.");
          }}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="dark">
      <CmsLoginView
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBackToSite={() => router.push("/")}
        showToast={showToast}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
