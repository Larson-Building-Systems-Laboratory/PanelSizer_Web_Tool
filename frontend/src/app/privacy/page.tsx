import type { Metadata } from 'next';
import Link from 'next/link';
import { DocumentSection, SiteDocument } from '@/components/SiteFrame';

export const metadata: Metadata = { title: 'Privacy | Panel Sizer' };

export default function Privacy() {
  return (
    <SiteDocument
      title="Privacy policy"
      summary="Panel Sizer has no accounts and asks for no personal information. This page describes what is sent to our server when you use it."
    >
      <DocumentSection title="What you send">
        <p>
          When you click <strong>Calculate Panel Size</strong>, your browser sends the numbers on screen to our
          server: floor area, circuit counts, conductor material, method, phase, and the name, wattage and
          voltage of each appliance. None of this identifies you.
        </p>
        <p>
          The server runs the calculation, returns the result and keeps no copy. It has no database. Your
          entries disappear when you close or reload the page.
        </p>
      </DocumentSection>

      <DocumentSection title="What we do not do">
        <ul>
          <li>No sign-in, no user accounts.</li>
          <li>No cookies and nothing saved in your browser&apos;s storage.</li>
          <li>No analytics, advertising or tracking scripts.</li>
          <li>No third-party fonts or embeds; the intro video is served from this site.</li>
        </ul>
      </DocumentSection>

      <DocumentSection title="Hosting logs">
        <p>
          The site and its server run on Microsoft Azure. As with any website, the host records standard request
          logs (IP address, time, the page requested and browser type) for security and troubleshooting.
        </p>
      </DocumentSection>

      <DocumentSection title="Changes and questions">
        <p>
          If the tool starts handling data differently, this page will be updated first. Questions go to the lab
          through the <Link href="/contact">contact page</Link>.
        </p>
        <p className="text-xs text-muted">Last updated October 2026</p>
      </DocumentSection>
    </SiteDocument>
  );
}
