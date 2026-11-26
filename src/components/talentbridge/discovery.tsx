import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";
import { PublicShell, Avatar, PageHeading, WorkspaceShell } from "./shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { catalogQuery, workspaceQuery, type Catalog } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { matchCareer, type MatchProfile } from "@/lib/matching";
import { toast } from "sonner";
type Mentor = Catalog["mentors"][number];
type Opportunity = Catalog["opportunities"][number];
export function MentorCard({ mentor, profile }: { mentor: Mentor; profile?: MatchProfile }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data: user } = useUser();
  const qc = useQueryClient();
  const match = profile ? matchCareer(profile, mentor) : null;
  async function request(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("mentor_requests")
      .insert({ user_id: user.id, mentor_id: mentor.id, message: String(form.get("message")) });
    setBusy(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "You’ve already sent a request to this mentor." : error.message,
      );
      return;
    }
    toast.success(
      mentor.is_demo
        ? "Sample mentorship request saved. No external mentor is contacted."
        : "Mentorship request sent",
    );
    qc.invalidateQueries({ queryKey: ["workspace"] });
    setOpen(false);
  }
  return (
    <>
      <article className="content-panel flex flex-col">
        <div className="flex items-start justify-between">
          <Avatar name={mentor.name} tone={mentor.name.length % 4} />
          <span className="status-tag">{mentor.available ? "Available" : "Not available"}</span>
        </div>
        <h3 className="mt-5 text-lg">{mentor.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {mentor.title}{" "}
          <span className="font-medium text-foreground">at {mentor.company || "TalentBridge"}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {mentor.location || "Remote"}
          </span>
          <span className="flex items-center gap-1">
            <BriefcaseBusiness size={12} />
            {mentor.years_experience} years
          </span>
        </div>
        <p className="my-4 text-xs leading-6 text-muted-foreground">
          {mentor.bio || "A professional mentor ready to support your next career chapter."}
        </p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {mentor.skills.map((s) => (
            <span className="tag" key={s}>
              {s}
            </span>
          ))}
        </div>
        {match && (
          <div className="mb-4 border-t pt-3">
            <p className="flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles size={13} />
              {match.score}% skills-based match
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              {match.reasons[0] || "Add skills to your profile for a more personal match."}
            </p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          {mentor.is_demo && (
            <span className="text-[10px] text-muted-foreground">Sample mentor</span>
          )}
          <Button className="ml-auto" onClick={() => setOpen(true)} disabled={!mentor.available}>
            Connect <ArrowRight />
          </Button>
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Connect with {mentor.name}</DialogTitle>
          <DialogDescription>
            {mentor.is_demo
              ? "This is a sample mentor. Your request is saved for demonstration, but no person is contacted."
              : "Share your goals and what you hope to learn."}
          </DialogDescription>
          {user ? (
            <form onSubmit={request} className="space-y-5">
              <label className="field">
                Your mentorship goals
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="I’d love guidance on…"
                />
              </label>
              <Button type="submit" disabled={busy}>
                {busy ? "Sending…" : "Send mentorship request"}
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in to connect</Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function OpportunityCard({
  opportunity,
  profile,
}: {
  opportunity: Opportunity;
  profile?: MatchProfile;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data: user } = useUser();
  const qc = useQueryClient();
  const match = profile ? matchCareer(profile, opportunity) : null;
  async function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        opportunity_id: opportunity.id,
        cover_note: String(form.get("note")),
      });
    setBusy(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "You’ve already applied for this opportunity." : error.message,
      );
      return;
    }
    toast.success(
      opportunity.is_demo
        ? "Sample application saved. No external organization is contacted."
        : "Application submitted",
    );
    qc.invalidateQueries({ queryKey: ["workspace"] });
    setOpen(false);
  }
  return (
    <>
      <article className="content-panel flex flex-col">
        <div className="flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-md bg-soft-blue text-navy">
            <BriefcaseBusiness size={21} />
          </span>
          <span className="tag">{opportunity.kind}</span>
        </div>
        <p className="mb-2 mt-5 text-[11px] font-medium text-primary">{opportunity.company}</p>
        <h3 className="text-lg leading-7">{opportunity.title}</h3>
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {opportunity.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {opportunity.duration}
          </span>
        </div>
        <p className="my-4 text-xs leading-6 text-muted-foreground">{opportunity.description}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {opportunity.skills.map((s) => (
            <span className="tag" key={s}>
              {s}
            </span>
          ))}
        </div>
        <p className="mb-4 text-[11px] font-medium text-primary">{opportunity.compensation}</p>
        {match && (
          <div className="mb-4 border-t pt-3">
            <p className="flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles size={13} />
              {match.score}% skills-based match
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              {match.reasons.join(" · ") ||
                "Add your skills and interests to personalize this match."}
            </p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          {opportunity.is_demo && (
            <span className="text-[10px] text-muted-foreground">Sample opportunity</span>
          )}
          <Button variant="outline" className="ml-auto" onClick={() => setOpen(true)}>
            View & apply <ArrowRight />
          </Button>
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>{opportunity.title}</DialogTitle>
          <DialogDescription>
            {opportunity.company} · {opportunity.location} · {opportunity.duration}
          </DialogDescription>
          <p className="text-sm leading-7">{opportunity.description}</p>
          {opportunity.is_demo && (
            <p className="rounded-md bg-muted p-3 text-xs leading-6 text-muted-foreground">
              Sample opportunity: your application is saved, but no external organization is
              contacted.
            </p>
          )}
          {user ? (
            <form onSubmit={apply} className="space-y-5">
              <label className="field">
                Why are you interested?
                <textarea
                  name="note"
                  required
                  minLength={20}
                  maxLength={3000}
                  placeholder="Tell us about your skills and goals…"
                />
              </label>
              <p className="text-[11px] leading-5 text-muted-foreground">
                Employers can only discover your profile and CV when you enable visibility in My
                Profile.
              </p>
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit application"}
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in to apply</Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function DiscoveryPage({ kind }: { kind: "mentors" | "experience" | "jobs" }) {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [type, setType] = useState("All types");
  const title =
    kind === "mentors"
      ? "The right guidance. A real connection."
      : kind === "experience"
        ? "Experience that opens doors."
        : "Your skills. Your next opportunity.";
  const mentors = catalog.mentors.filter(
    (m) =>
      (industry === "All industries" || m.industry === industry) &&
      `${m.name} ${m.title} ${m.skills.join(" ")} ${m.location}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const opportunities = catalog.opportunities.filter(
    (o) =>
      (kind === "jobs" ? o.kind === "Job" || o.kind === "Internship" : o.kind !== "Job") &&
      (industry === "All industries" || o.industry === industry) &&
      (type === "All types" || o.kind === type) &&
      `${o.title} ${o.company} ${o.skills.join(" ")} ${o.location}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <PublicShell>
      <section className="border-b bg-secondary py-14">
        <div className="container-wide">
          <p className="section-eyebrow">
            {kind === "mentors"
              ? "MentorConnect"
              : kind === "experience"
                ? "Experience Hub"
                : "Opportunities"}
          </p>
          <h1 className="section-title">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {kind === "mentors"
              ? "Connect with experienced professionals who can help you navigate your next chapter."
              : kind === "experience"
                ? "Real projects, virtual internships and practical challenges. Put your skills to work and build a portfolio that proves your potential."
                : "Find work that values your experience and gives your potential room to grow."}
          </p>
        </div>
      </section>
      <main className="container-wide py-10">
        <div className="mb-7 flex flex-wrap gap-3">
          <label className="relative min-w-60 flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
            <input
              aria-label="Search"
              className="filter-input w-full pl-10"
              placeholder={
                kind === "mentors"
                  ? "Search mentors, skills or locations…"
                  : "Search opportunities or skills…"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="filter-input"
            aria-label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {["All industries", "Design", "Technology", "Marketing", "Data"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {kind !== "mentors" && (
            <select
              aria-label="Opportunity type"
              className="filter-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {["All types", "Job", "Internship", "Project", "Volunteering", "Challenge"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          )}
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {kind === "mentors" ? mentors.length : opportunities.length}{" "}
            {kind === "mentors" ? "mentors" : "opportunities"} found
          </p>
          <Link to="/recommendations" className="flex items-center gap-1.5 text-xs text-primary">
            <Sparkles size={14} /> See your personal matches <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {kind === "mentors"
            ? mentors.map((m) => <MentorCard key={m.id} mentor={m} />)
            : opportunities.map((o) => <OpportunityCard key={o.id} opportunity={o} />)}
        </div>
        {(kind === "mentors" ? mentors.length : opportunities.length) === 0 && (
          <p className="empty-state">No matches yet. Try another skill or remove a filter.</p>
        )}
        <div className="mt-10 flex items-center gap-2 border-t pt-6 text-xs text-muted-foreground">
          <ShieldNote />
        </div>
      </main>
    </PublicShell>
  );
}
function ShieldNote() {
  return (
    <>
      <CheckCircle2 size={16} className="text-primary" />
      Open to all professional backgrounds. Skills first, always.
    </>
  );
}
export function RecommendationsPage() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const [tab, setTab] = useState("Opportunities");
  const profile = ws.profile ?? { skills: [], interests: [], location: "", experience: "" };
  const opportunities = [...catalog.opportunities].sort(
    (a, b) => matchCareer(profile, b).score - matchCareer(profile, a).score,
  );
  const mentors = [...catalog.mentors].sort(
    (a, b) => matchCareer(profile, b).score - matchCareer(profile, a).score,
  );
  return (
    <WorkspaceShell title="Career Matches">
      <PageHeading
        title="Good opportunities. A better fit."
        subtitle="Personal recommendations, built around your skills and ambitions."
        action={
          <Button asChild variant="outline">
            <Link to="/profile">Update my skills</Link>
          </Button>
        }
      />
      <div className="mb-7 flex items-start gap-3 rounded-md border border-primary/20 bg-secondary p-5">
        <Sparkles className="shrink-0 text-primary" size={22} />
        <div>
          <h2 className="text-sm">Skills-based matching · not live AI</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Matches consider your skills, interests, location and experience. Each recommendation
            explains the fit.{" "}
            {profile.skills.length === 0
              ? "Add skills to your profile to get personal results."
              : ""}
          </p>
        </div>
      </div>
      <div className="mb-6 flex gap-3">
        {["Opportunities", "Mentors"].map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "Mentors" ? <Users /> : <BriefcaseBusiness />}
            {t}
          </Button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tab === "Mentors"
          ? mentors.map((m) => <MentorCard key={m.id} mentor={m} profile={profile} />)
          : opportunities.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} profile={profile} />
            ))}
      </div>
    </WorkspaceShell>
  );
}
