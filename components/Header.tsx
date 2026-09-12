import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface HeaderProps {
  user: { email: string; isAdmin: boolean } | null;
}

const NAV_LINKS = [
  { href: "/races", label: "Races" },
  { href: "/alimentation", label: "Alimentation" },
  { href: "/abonnement", label: "Abonnement" },
];

export default function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="container-page py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-orange-dark">
          <span aria-hidden>🐾</span> Clebo
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-foreground-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-orange-dark transition-colors">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/demandes-exercices" className="hover:text-orange-dark transition-colors">
              Demandes d&apos;exercices
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin" className="hover:text-orange-dark transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold hidden sm:inline text-foreground-muted hover:text-orange-dark">
                {user.email}
              </Link>
              <Link href="/dashboard" className="btn-outline text-sm py-2 px-4">
                Mon espace
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/connexion" className="btn-outline text-sm py-2 px-4">
                Connexion
              </Link>
              <Link href="/inscription" className="btn-primary text-sm py-2 px-4">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
