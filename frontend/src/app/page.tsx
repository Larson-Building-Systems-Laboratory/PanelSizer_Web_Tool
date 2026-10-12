import Link from 'next/link';
import { PRIMARY_LINK, SiteFrame } from '@/components/SiteFrame';

const STEPS = [
  {
    title: 'Enter the dwelling',
    body: 'Floor area, kitchen and laundry circuits, conductor material, calculation method and service phase.',
  },
  {
    title: 'Add the appliances',
    body: 'Range, dryer, water heater, HVAC and anything else on a dedicated circuit, each with its wattage and voltage.',
  },
  {
    title: 'Get the service size',
    body: 'The service rating, the service, neutral and grounding conductor sizes, a wiring schematic and a line-by-line calculation log.',
  },
];

export default function Landing() {
  return (
    <SiteFrame>
      <section className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 items-center max-[900px]:grid-cols-1 max-[900px]:gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight leading-tight max-sm:text-3xl">
            What size electrical panel does this house need?
          </h1>
          <p className="mt-4 text-base text-muted max-w-md">
            Add up every appliance and you will oversize it. Panel Sizer runs the NEC load calculation for you
            and logs every step so you can check the work.
          </p>
          <Link href="/tool" className={`${PRIMARY_LINK} inline-block mt-6 px-7 py-3 text-base`}>
            Get started
          </Link>
        </div>

        <figure>
          <video
            className="w-full aspect-video rounded-lg border border-border bg-header-to shadow-sm"
            controls
            playsInline
            preload="metadata"
            poster="/intro-poster.jpg"
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <figcaption className="mt-2 text-xs text-muted">A 20-second intro, recorded in the live tool.</figcaption>
        </figure>
      </section>

      <ol className="mt-10 grid grid-cols-3 gap-6 max-[900px]:grid-cols-1 max-sm:gap-4">
        {STEPS.map((step, idx) => (
          <li key={step.title} className="bg-bg-card border border-border rounded-lg shadow-sm px-6 py-5">
            <span className="w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <h2 className="mt-3 text-base font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </SiteFrame>
  );
}
