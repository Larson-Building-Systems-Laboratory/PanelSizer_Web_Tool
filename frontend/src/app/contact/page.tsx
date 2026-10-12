import type { Metadata } from 'next';
import { DocumentSection, SiteDocument } from '@/components/SiteFrame';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact | Panel Sizer' };

export default function Contact() {
  return (
    <SiteDocument
      title="Contact"
      summary="Panel Sizer is built and maintained at the Larson Building Systems Laboratory, CU Boulder."
    >
      <DocumentSection title="Get in touch">
        <p>Questions, collaboration requests and bug reports go through the lab&apos;s contact form.</p>
        <p>
          <a href={SITE.lab.contactUrl} target="_blank" rel="noreferrer">Open the lab contact page</a>
        </p>
      </DocumentSection>

      <DocumentSection title="Address">
        <address className="not-italic">
          <strong>{SITE.lab.name}</strong>
          {SITE.lab.address.map(line => (
            <span key={line} className="block">{line}</span>
          ))}
          <a href={`tel:+1-${SITE.lab.phone}`} className="block mt-2">{SITE.lab.phone}</a>
        </address>
      </DocumentSection>

      <DocumentSection title="Reporting a problem">
        <p>It helps to include:</p>
        <ul>
          <li>the dwelling inputs and the appliance list you entered,</li>
          <li>the calculation log from the results, if you got that far,</li>
          <li>what you expected and what you saw instead.</li>
        </ul>
      </DocumentSection>
    </SiteDocument>
  );
}
