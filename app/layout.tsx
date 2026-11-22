import type { Metadata } from "next";
import Link from "next/link";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import "@fontsource/archivo-black/latin-400.css";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "./globals.css";

const siteUrl = process.env.SITE_URL;
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "SkillWhisk — Copy-ready AI project recipes", template: "%s | SkillWhisk" },
  description: "Find a project recipe, pick a UI style, and copy a prompt with curated skills, repositories, and checks for your coding agent.",
  openGraph: {
    type: "website",
    siteName: "SkillWhisk",
  },
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
            <p>© {new Date().getUTCFullYear()} SkillWhisk</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
