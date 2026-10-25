import Link from 'next/link';
import { SiteFrame } from '@/components/SiteFrame';

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
      {/* Hero tile */}
      <section className="bg-canvas px-6 pt-20 pb-20 text-center max-sm:px-4 max-sm:pt-12 max-sm:pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="animate-enter text-[17px] font-semibold text-primary">NEC load calculation</p>
          <h1 className="animate-enter mt-3 text-[56px] leading-[1.07] tracking-[-0.9px] [animation-delay:80ms] max-md:text-[40px] max-sm:text-[34px] max-sm:tracking-[-0.4px]">
            What size electrical panel does this house need?
          </h1>
          <p className="animate-enter mt-5 max-w-xl mx-auto text-[21px] font-light leading-[1.5] text-muted [animation-delay:160ms] max-sm:text-[17px]">
            Add up every appliance and you will oversize it. Panel Sizer runs the NEC load calculation for you
            and logs every step so you can check the work.
          </p>
          <div className="animate-enter mt-8 flex flex-wrap justify-center gap-3 [animation-delay:240ms]">
            <Link href="/tool" className="btn btn-primary">Open the tool</Link>
            <a href="#intro" className="btn btn-secondary">Watch the intro</a>
          </div>
        </div>

        <figure id="intro" className="animate-scale-in mt-14 max-w-[1040px] mx-auto scroll-mt-24 [animation-delay:320ms]">
          <video
            className="w-full aspect-video rounded-card bg-canopy shadow-render"
            controls
            playsInline
            preload="metadata"
            poster="/intro-poster.jpg"
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <figcaption className="mt-4 text-[14px] text-faint">A 20-second intro, recorded in the live tool.</figcaption>
        </figure>
      </section>

      {/* Steps tile */}
      <section className="bg-mist px-6 py-20 max-sm:px-4 max-sm:py-12" aria-labelledby="how">
        <div className="max-w-[1100px] mx-auto">
          <h2 id="how" data-reveal className="text-center text-[40px] leading-[1.1] tracking-[-0.5px] max-sm:text-[30px]">
            Three steps to a service size.
          </h2>
          <ol className="mt-12 grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            {STEPS.map((step, idx) => (
              <li
                key={step.title}
                data-reveal
                style={{ '--d': `${idx * 90}ms` } as React.CSSProperties}
                className="card p-7"
              >
                <span className="nums w-9 h-9 rounded-full bg-mint text-primary text-[15px] font-semibold flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="mt-5 text-[21px] leading-[1.19] tracking-[-0.2px]">{step.title}</h3>
                <p className="mt-2 text-[17px] leading-[1.47] text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Canopy tile */}
      <section className="on-dark bg-canopy px-6 py-20 text-center max-sm:px-4 max-sm:py-14">
        <div data-reveal className="max-w-2xl mx-auto">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.5px] max-sm:text-[30px]">Every step, shown.</h2>
          <p className="mt-4 text-[21px] font-light leading-[1.5] text-mint max-sm:text-[17px]">
            Results come with a wiring schematic and a line-by-line calculation log, so the numbers can be checked.
          </p>
          <div className="mt-10">
            <Link href="/tool" className="btn btn-on-dark">Size a panel</Link>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
