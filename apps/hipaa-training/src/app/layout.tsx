import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientShell from "@/components/training/ClientShell";
import { ShiftProvider } from "@/context/ShiftContext";
import { PortalSessionSync } from "@/components/companion/PortalSessionSync";
import { BRAND } from "@/lib/brand";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.appName} · Team portal`,
  description: "My day, team presence, tasks, learning, and internal help for Siya Health staff.",
  applicationName: BRAND.appName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ShiftProvider>
            <PortalSessionSync />
            <ClientShell>{children}</ClientShell>
          </ShiftProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
