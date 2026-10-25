import Link from 'next/link';
import { SITE, SITE_LINKS } from '@/lib/site';
import { BestLogo } from './BestLogo';

// Global nav: frosted, sticky, with the BEST green rule along the bottom
export function SiteNav({ children }: { children?: React.ReactNode }) {
  return (
    <header className="frosted sticky top-0 z-40 border-b-2 border-brand">
      <div className="max-w-7xl mx-auto h-[52px] flex items-center justify-between gap-4 px-6 max-sm:px-4">
        <div className="flex items-center gap-3 min-w-0">
          <BestLogo height={30} />
          <span aria-hidden className="h-6 w-px shrink-0 bg-hairline max-sm:hidden" />
          <Link href="/" className="flex items-baseline gap-2 min-w-0 max-sm:hidden">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{SITE.name}</span>
            <span className="text-[13px] text-muted truncate max-lg:hidden">{SITE.tagline}</span>
          </Link>
        </div>
        {children ?? (
          <nav aria-label="Site" className="flex items-center gap-6 max-sm:gap-3">
            {SITE_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-[13px] text-muted hover:text-body transition-colors max-sm:hidden">
                {link.label}
              </Link>
            ))}
            <Link href="/tool" className="btn btn-primary btn-sm">Open the tool</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-mint text-ink border-t-4 border-brand">
      <div className="max-w-7xl mx-auto px-6 py-10 max-sm:px-4 flex flex-wrap items-center justify-between gap-6 text-[12px]">
        <div className="flex flex-wrap items-center gap-4">
          <BestLogo height={40} />
          <span aria-hidden className="h-8 w-px bg-ink max-sm:hidden" />
          <div>
            <p className="text-[14px] font-semibold">{SITE.name}</p>
            <p className="mt-1">© <span className="nums">{SITE.year}</span> {SITE.owner}</p>
          </div>
        </div>
        <nav aria-label="Legal" className="flex gap-6">
          {SITE_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="underline-offset-2 hover:underline">{link.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

// Shared frame for the landing page and the legal pages
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

// A legal or contact page: a title over a stack of headed cards
export function SiteDocument({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  return (
    <SiteFrame>
      <article className="bg-mist">
        <div className="max-w-[760px] mx-auto px-6 pt-16 pb-20 max-sm:px-4 max-sm:pt-10">
          <div className="animate-enter">
            <p className="text-[14px] font-semibold text-primary">{SITE.name}</p>
            <h1 className="mt-2 text-[40px] leading-[1.1] tracking-[-0.5px] max-sm:text-[30px]">{title}</h1>
            <p className="mt-4 text-[21px] font-light leading-[1.5] text-muted max-sm:text-[17px]">{summary}</p>
          </div>
          <div className="stagger mt-12 flex flex-col gap-4">{children}</div>
        </div>
      </article>
    </SiteFrame>
  );
}

export function DocumentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 max-sm:p-5">
      <h2 className="text-[21px] tracking-[-0.2px]">{title}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-[1.47] text-muted [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-body [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
