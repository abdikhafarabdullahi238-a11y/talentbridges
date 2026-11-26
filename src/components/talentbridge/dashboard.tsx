import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import { WorkspaceShell, PageHeading } from "./shell";
import { Button } from "@/components/ui/button";
import { catalogQuery, workspaceQuery } from "@/lib/queries";
import { OpportunityCard, MentorCard } from "./discovery";
import { matchCareer } from "@/lib/matching";
export function Dashboard() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const name = ws.profile?.full_name.split(" ")[0] || "there";
  const p = ws.profile;
  const ownApps = ws.applications.filter((a) => a.user_id === ws.userId);
  const ownRequests = ws.requests.filter((r) => r.user_id === ws.userId);
  const completion = p
    ? [p.full_name, p.headline, p.summary, p.skills.length, p.experience, p.education].filter(
        Boolean,
      ).length
    : 0;
  const recommended = p
    ? [...catalog.opportunities]
        .sort((a, b) => matchCareer(p, b).score - matchCareer(p, a).score)
        .slice(0, 2)
    : catalog.opportunities.slice(0, 2);
  return (
    <WorkspaceShell title="Overview">
      <PageHeading
        title={`Welcome, ${name}. Your next chapter awaits.`}
        subtitle="A little progress today can open a big door tomorrow."
        action={
          <Button asChild variant="outline">
            <Link to="/profile">
              <UserRound />
              My profile
            </Link>
          </Button>
        }
      />
      {ws.role !== "professional" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-secondary p-5">
          <p className="text-sm">Your {ws.role} workspace is ready.</p>
          <Button asChild>
            <Link to={ws.role === "mentor" ? "/mentor-dashboard" : "/employer"}>
              Open {ws.role} dashboard <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
      <section className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-lg bg-navy p-7 text-on-dark">
        <div>
          <span className="text-[10px] uppercase text-teal-light">
            Your potential, made visible
          </span>
          <h2 className="mt-2 text-xl">A strong profile is your first introduction.</h2>
          <p className="mt-2 text-xs text-on-dark/70">
            {completion} of 6 key profile sections complete
          </p>
          <progress
            aria-label="Profile completeness"
            value={completion}
            max={6}
            className="mt-4 h-1.5 w-60 max-w-full accent-primary"
          />
        </div>
        <Button asChild variant="hero">
          <Link to="/profile">
            {completion === 6 ? "Refine my profile" : "Complete my profile"}
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Applications sent", value: ownApps.length, icon: BriefcaseBusiness },
          {
            label: "Mentorship connections",
            value: ownRequests.filter((r) => r.status === "accepted").length,
            icon: Users,
          },
          {
            label: "Projects completed",
            value: ownApps.filter((a) => a.status === "completed").length,
            icon: CheckCircle2,
          },
          { label: "Available opportunities", value: catalog.opportunities.length, icon: Compass },
        ].map((s) => (
          <div className="stat" key={s.label}>
            <div className="flex items-center justify-between gap-2">
              <span className="stat-label">{s.label}</span>
              <s.icon size={18} className="text-primary" />
            </div>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base">
          <Sparkles size={18} className="text-primary" />
          Opportunities for your next move
        </h2>
        <Link to="/recommendations" className="flex items-center gap-1 text-xs text-primary">
          View matches <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        {recommended.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} {...(p ? { profile: p } : {})} />
        ))}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base">Your application journey</h2>
        <Link to="/experience" className="flex items-center gap-1 text-xs text-primary">
          Experience Hub <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mb-8 overflow-hidden rounded-md border bg-card">
        {ownApps.length ? (
          ownApps.map((a) => {
            const o = catalog.opportunities.find((o) => o.id === a.opportunity_id);
            return (
              <div key={a.id} className="border-b p-5 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm">{o?.title || "Opportunity"}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {o?.company} · {new Date(a.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span className="status-tag">{a.status}</span>
                </div>
                {a.feedback && (
                  <p className="mt-3 text-xs leading-6">Supervisor feedback: {a.feedback}</p>
                )}
                {a.reference && (
                  <p className="mt-2 text-xs text-primary">Professional reference: {a.reference}</p>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <BriefcaseBusiness className="mx-auto mb-3" size={24} />
            <p>Your journey is just beginning.</p>
            <Link to="/experience" className="mt-3 inline-block text-primary">
              Find your first practical opportunity →
            </Link>
          </div>
        )}
      </div>
      <h2 className="mb-5 text-base">Your mentorship requests</h2>
      <div className="rounded-md border bg-card">
        {ownRequests.length ? (
          ownRequests.map((r) => (
            <div
              className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0"
              key={r.id}
            >
              <div>
                <p className="text-sm font-medium">
                  {catalog.mentors.find((m) => m.id === r.mentor_id)?.name || "Mentor"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.session_at
                    ? `Session: ${new Date(r.session_at).toLocaleString("en-GB")}`
                    : "A meaningful connection starts with a conversation."}
                </p>
                {r.feedback && <p className="mt-2 text-xs">{r.feedback}</p>}
              </div>
              <span className="status-tag">{r.status}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            You haven’t reached out to a mentor yet.{" "}
            <Link to="/mentors" className="text-primary">
              Find your mentor →
            </Link>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
