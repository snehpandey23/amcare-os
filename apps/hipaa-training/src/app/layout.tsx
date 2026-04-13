import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/training/ClientShell";

export const metadata: Metadata = {
  title: "HIPAA Workforce Training",
  description: "Interactive HIPAA training aligned to your Gamma Compliance welcome kit and HIPAA Manual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
