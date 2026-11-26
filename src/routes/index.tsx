import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  Lightbulb,
  Network,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell, Avatar } from "@/components/talentbridge/shell";
import { pageHead } from "@/lib/metadata";
import workplace from "@/assets/workplace.asset.json";
export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead(
      "Your talent has no borders",
      "TalentBridge connects skilled refugees and displaced professionals with mentors, real-world experience and meaningful employment.",
    );
    return {
      meta: [
        ...head.meta,
        { property: "og:image", content: workplace.url },
        { name: "twitter:image", content: workplace.url },
      ],
    };
  },
  component: Home,
});
function Home() {
  return (
    <PublicShell>
      <section className="hero">
        <img
          className="hero-image"
          src={workplace.url}
          alt="Diverse professionals collaborating in a modern workplace"
        />
        <div className="container-wide hero-inner">
          <span className="hero-label">
            <span className="size-1.5 rounded-full bg-primary" /> Skills without borders. Futures
            without limits.
          </span>
          <h1>
            Your Talent Has
            <br />
            No Borders.
            <br />
            Your Opportunities
            <br />
            <em>Shouldn’t Either.</em>
          </h1>
          <p className="hero-description">
            TalentBridge connects skilled refugees and displaced professionals with mentors,
            real-world experience, and opportunities to build a brighter professional future.
          </p>
          <div className="hero-actions">
            <Button asChild variant="hero">
              <Link to="/signup">
                Get Started <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="heroOutline">
              <Link to="/signup" search={{ role: "mentor" }}>
                Become a Mentor <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              {["Lina Mahmoud", "David Okafor", "Sarah Chen", "Amira Hassan"].map((name, i) => (
                <Avatar key={name} name={name} tone={i} />
              ))}
            </div>
            <span>Built for potential. Open to everyone.</span>
            <ShieldCheck size={15} />
          </div>
        </div>
        <div className="hero-float">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
              <CheckCircle2 size={23} />
            </span>
            <div>
              <p className="text-xs font-semibold">A new chapter starts here.</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Your experience is your advantage.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-band">
        <div className="container-wide flex flex-wrap items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground">A shared mission. A world of possibility.</p>
          <div className="flex flex-wrap items-center gap-7 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-2">
              <Globe2 size={21} /> Inclusive by design
            </span>
            <span className="flex items-center gap-2">
              <HeartHandshake size={22} /> Human connections
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={21} /> Skills first. Always.
            </span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-wide">
          <div className="text-center">
            <p className="section-eyebrow">More than a job platform</p>
            <h2 className="section-title">
              The bridge between your potential
              <br className="hidden sm:block" /> and your next opportunity.
            </h2>
            <p className="section-description">
              A new place shouldn’t mean starting from zero. We help you build the connections,
              experience, and confidence to move forward.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Connect with people",
                text: "Meet mentors who understand your industry. Build a professional network that sees your skills and believes in your potential.",
                link: "/mentors" as const,
                cta: "Find your mentor",
              },
              {
                icon: Lightbulb,
                title: "Experience that counts",
                text: "Put your skills into practice through real projects, internships, and meaningful assignments. Build a portfolio that opens doors.",
                link: "/experience" as const,
                cta: "Explore Experience Hub",
              },
              {
                icon: Sprout,
                title: "Grow your career",
                text: "Discover opportunities that match your ambitions. Connect with inclusive employers ready to invest in what you bring.",
                link: "/opportunities" as const,
                cta: "Discover opportunities",
              },
            ].map((p) => (
              <article className="pillar" key={p.title}>
                <span className="pillar-icon">
                  <p.icon size={25} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <Link
                  to={p.link}
                  className="mt-auto flex items-center gap-2 text-xs font-semibold text-primary"
                >
                  {p.cta}
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="section-eyebrow">Talent is universal. Access isn’t.</p>
            <h2 className="section-title">
              A fresh start.
              <br />
              Not a step backwards.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              Your qualifications and experience still matter. We’re here to bridge the gaps that
              too often stand between talented professionals and their next opportunity.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["Local experience", "Prove your abilities through practical projects."],
              ["Professional networks", "Meet people who help open new doors."],
              ["Access to mentorship", "Get guidance from experienced professionals."],
              ["Employer visibility", "Let your skills make the first impression."],
            ].map(([t, d]) => (
              <div key={t} className="border-l-2 border-primary pl-4">
                <h3 className="text-sm">{t}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-wide">
          <div className="text-center">
            <p className="section-eyebrow">Your next chapter, in four steps</p>
            <h2 className="section-title">Small steps. Meaningful progress.</h2>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Build your profile", "Bring your skills and experience together."],
              ["Find your people", "Discover mentors and relevant opportunities."],
              ["Put skills into practice", "Gain experience, feedback and references."],
              ["Open new doors", "Connect with employers and grow."],
            ].map(([t, d], i) => (
              <div key={t}>
                <span className="mb-5 grid size-10 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">
                  0{i + 1}
                </span>
                <h3 className="text-sm">{t}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-navy text-on-dark">
        <div className="container-wide">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="section-eyebrow text-teal-light">
                Every connection can change a future
              </p>
              <h2 className="section-title">The impact we’re building together.</h2>
            </div>
            <span className="text-[10px] text-on-dark/60">
              Illustrative demo statistics · not live platform totals
            </span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              ["1,200+", "Professionals connected"],
              ["350+", "Mentorship relationships"],
              ["180+", "Practical projects completed"],
              ["500+", "Opportunities accessed"],
            ].map(([v, t]) => (
              <div key={t}>
                <p className="text-4xl font-semibold">{v}</p>
                <p className="mt-3 text-xs text-on-dark/70">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-secondary text-center">
        <div className="container-wide">
          <Network className="mx-auto mb-5 text-primary" size={30} />
          <h2 className="section-title">
            Your experience matters. Your skills matter.
            <br />
            Your future matters.
          </h2>
          <p className="section-description">Let’s build your next chapter, together.</p>
          <Button asChild size="lg" className="mt-7">
            <Link to="/signup">
              Join TalentBridge Today <ArrowUpRight />
            </Link>
          </Button>
          <div className="mt-5 flex justify-center gap-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check size={12} /> Free to join
            </span>
            <span className="flex items-center gap-1">
              <Check size={12} /> Open to all backgrounds
            </span>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
