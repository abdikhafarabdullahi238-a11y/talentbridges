import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/talentbridge/shell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "Our mission",
      "Rebuilding professional networks, proving abilities and unlocking potential.",
    ),
  component: About,
});
function About() {
  return (
    <PublicShell>
      <main className="container-wide section">
        <p className="section-eyebrow">About TalentBridge</p>
        <h1 className="section-title max-w-3xl">
          Talent is universal.
          <br />
          Opportunity should be, too.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">
          We don’t just help displaced professionals find jobs. We help them rebuild their
          professional networks, prove their abilities, gain experience, and unlock their potential.
        </p>
        <div className="mt-14 grid gap-9 md:grid-cols-3">
          {[
            [
              "Connect",
              "Mentorship and professional networks turn unfamiliar places into communities of possibility.",
            ],
            [
              "Experience",
              "Practical projects make skills visible and create a bridge to local work experience.",
            ],
            [
              "Grow",
              "Inclusive employers connect with people based on abilities, ambition and professional potential.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="border-t-2 border-primary pt-6">
              <h2 className="text-xl">{t}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <section className="mt-16 border-y py-10">
          <h2 className="text-xl">A mission with global impact</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Supporting SDG 8: Decent Work and Economic Growth · SDG 10: Reduced Inequalities · SDG
            17: Partnerships for the Goals.
          </p>
        </section>
        <Button asChild size="lg" className="mt-10">
          <Link to="/signup">Be part of the bridge</Link>
        </Button>
      </main>
    </PublicShell>
  );
}
