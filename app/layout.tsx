import type { Metadata } from "next";
import Link from "next/link";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { homeDescription, homeTitle, siteOrigin } from "@/lib/seo";
import "@fontsource/archivo-black/latin-400.css";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: homeTitle,
  description: homeDescription,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <div className="page-shell header-inner">
            <Link className="brand" href="/" aria-label="SkillWhisk home">
              <span className="brand-mark" aria-hidden="true"><i /><i /></span>
              <span>SkillWhisk</span>
            </Link>
            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/#recipes">Recipes</Link>
              <Link href="/#boosters">Workflow boosters</Link>
              <Link className="nav-create" href="/custom">Create recipe</Link>
            </nav>
          </div>
        </header>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <footer className="site-footer">
          <div className="page-shell footer-inner">
            <Link className="brand" href="/" aria-label="SkillWhisk home">
              <span className="brand-mark" aria-hidden="true"><i /><i /></span>
              <span>SkillWhisk</span>
            </Link>
            <div className="footer-meta">
              <p>Powered by <strong>Waystoweb Technologies</strong></p>
              <p>© {new Date().getUTCFullYear()} SkillWhisk</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
