import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Clebo — Dressez votre chien, étape par étape",
  description:
    "Clebo : profils de chiens, techniques de dressage par race, conseils alimentation et calculateur personnalisé. Abonnement unique à 27,99€/mois.",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="fr" className={`${baloo.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background font-body text-foreground antialiased">
        <Header user={user ? { email: user.email, isAdmin: user.isAdmin } : null} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border-subtle mt-16">
          <div className="container-page py-8 text-sm text-foreground-muted flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Clebo</span>
            <span>Dressage canin pour tous, partout en France.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
