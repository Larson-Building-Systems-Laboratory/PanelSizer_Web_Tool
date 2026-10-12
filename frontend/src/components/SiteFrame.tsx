import Link from 'next/link';
import { SITE, SITE_LINKS } from '@/lib/site';

export const PRIMARY_LINK =
  'bg-blue text-white font-semibold rounded-lg hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';

// Header and footer shared by the landing page and the legal pages
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-header-from to-header-to px-8 py-4 max-sm:px-4 max-sm:py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Link href="/" className="flex items-center gap-4 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <span className="w-9 h-9 rounded bg-blue flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </span>
            <span>
              <span className="block text-white text-lg font-bold tracking-tight leading-tight">{SITE.name}</span>
              <span className="block text-header-sub text-[11px] leading-tight">{SITE.tagline}</span>
            </span>
          </Link>

          <nav aria-label="Site" className="flex items-center gap-5 text-sm max-sm:gap-4">
            {SITE_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-white/80 hover:text-white rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {link.label}
              </Link>
            ))}
            <Link href="/tool" className={`${PRIMARY_LINK} px-4 py-2`}>Get started</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 px-8 py-10 max-sm:px-4 max-sm:py-6">{children}</main>

      <footer className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-4 max-sm:px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <p>© {SITE.year} {SITE.owner}</p>
          <nav aria-label="Legal" className="flex gap-4">
            {SITE_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-text">{link.label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

// A legal or contact page: a title over a stack of headed cards
export function SiteDocument({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  return (
    <SiteFrame>
      <article className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight max-sm:text-2xl">{title}</h1>
        <p className="mt-2 text-muted">{summary}</p>
        <div className="mt-6 flex flex-col gap-4">{children}</div>
      </article>
    </SiteFrame>
  );
}

export function DocumentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm px-6 py-5 max-sm:px-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-log-normal [&_a]:text-green [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
