import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientShell from "@/components/training/ClientShell";

export const metadata: Metadata = {
  title: "SiyaOS — Internal workforce assistant",
  description: "Siya assistant for HIPAA, billing workflow, and escalation. Optional HIPAA certification training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ClientShell>{children}</ClientShell>
        </AuthProvider>
      </body>
    </html>
  );
}
