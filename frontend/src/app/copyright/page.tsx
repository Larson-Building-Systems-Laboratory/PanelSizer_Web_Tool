import type { Metadata } from 'next';
import Link from 'next/link';
import { DocumentSection, SiteDocument } from '@/components/SiteFrame';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Copyright | Panel Sizer' };

export default function Copyright() {
  return (
    <SiteDocument
      title="Copyright and terms of use"
      summary="Who owns the tool, what you may do with its results, and the limits of what it can tell you."
    >
      <DocumentSection title="Copyright">
        <p>© {SITE.year} {SITE.owner}. All rights reserved.</p>
        <p>
          The software, interface design, text and intro video on this site are protected by copyright. You may
          use the tool and include its results in your own project documents. Copying or redistributing the
          software or site content needs written permission.
        </p>
      </DocumentSection>

      <DocumentSection title="Trademarks">
        <p>
          NEC and National Electrical Code are registered trademarks of the National Fire Protection
          Association. Panel Sizer is not affiliated with or endorsed by the NFPA.
        </p>
      </DocumentSection>

      <DocumentSection title="No warranty">
        <p>
          The tool is provided as is, for education and preliminary sizing. Its results are not a permit
          document and do not replace a licensed electrician or engineer, the edition of the code adopted where
          you build, or the decision of the local inspector. The University of Colorado accepts no liability
          for work carried out from the results.
        </p>
      </DocumentSection>

      <DocumentSection title="Permissions">
        <p>
          To ask about reuse or licensing, write to the lab through the <Link href="/contact">contact page</Link>.
        </p>
      </DocumentSection>
    </SiteDocument>
  );
}
