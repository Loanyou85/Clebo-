import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface HeaderProps {
  user: { email: string; isAdmin: boolean } | null;
}

const NAV_LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/races", label: "Races" },
  { href: "/rations", label: "Rations" },
];

export default function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-brume bg-papier/95 backdrop-blur sticky top-0 z-20">
      <div className="container-page py-4 flex items-center justify-between gap-4">
        <Link href="/" className="titre text-titre-s">
          Clebo
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-encre-doux">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-encre transition-colors">
              {link.label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link href="/admin" className="hover:text-encre transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/app" className="btn-outline text-sm py-2 px-4">
                Mon espace
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm font-semibold text-encre-doux hover:text-encre transition-colors">
                Connexion
              </Link>
              <Link href="/diagnostic" className="btn-primary text-sm py-2 px-4">
                Diagnostic gratuit
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
