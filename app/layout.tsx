import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Inter_Tight } from "next/font/google";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Clebo — Ton chien marche en laisse sans tirer, en 30 jours",
    template: "%s — Clebo",
  },
  description:
    "Un programme de dressage daté jour par jour, une séance de 8 minutes, et un suivi qui mesure les progrès de ton chien. Diagnostic gratuit en 40 secondes.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Clebo",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};

const FOOTER_LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/races", label: "Races" },
  { href: "/rations", label: "Rations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  // Thème clair par défaut, sombre activable sans toucher au code :
  // THEME=sombre dans les variables d'environnement suffit. C'est ce qui
  // permet de lancer les deux sur du vrai trafic et de garder celui qui
  // convertit le mieux.
  const themeSombre = process.env.THEME?.trim().toLowerCase() === "sombre";

  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${interTight.variable} h-full ${themeSombre ? "theme-sombre" : ""}`}
    >
      <body className="min-h-full flex flex-col bg-fond font-body text-texte">
        <Header user={user ? { email: user.email, isAdmin: user.isAdmin } : null} />
        <main className="flex-1">{children}</main>

        <footer className="border-t border-bordure mt-24 overflow-hidden">
          <div className="container-page py-12">
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm mb-8">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-sourdine hover:text-texte transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-sm text-sourdine prose-clebo mb-10">
              © {new Date().getFullYear()} Clebo. Clebo ne traite pas les cas d&apos;agressivité, de morsure ou de
              réactivité : ces situations demandent un comportementaliste en présentiel.
            </p>
          </div>

          {/* Logotype géant en pied de page : le seul endroit du site où le
              titre déborde volontairement, il ferme la page. */}
          <p
            aria-hidden
            className="titre text-[22vw] leading-[0.8] text-texte/5 select-none text-center -mb-[4vw]"
          >
            Clebo
          </p>
        </footer>
      </body>
    </html>
  );
}
