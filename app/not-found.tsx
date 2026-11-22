import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell missing-page" tabIndex={-1}>
      <h1>Page not found</h1>
      <p>That address doesn’t lead to a recipe.</p>
      <Link className="button" href="/#recipes">Browse recipes</Link>
    </main>
  );
}
