import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Plus,
  Users,
  Search,
  Star,
  FileText,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { WorkspaceShell, PageHeading, Avatar } from "./shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { workspaceQuery, type Workspace } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
export function EmployerPage() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const kind = String(f.get("kind"));
    const { error } = await supabase.from("opportunities").insert({
      employer_id: ws.userId,
      title: String(f.get("title")),
      company: String(f.get("company")),
      kind,
      industry: String(f.get("industry")),
      skills: String(f.get("skills"))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location: String(f.get("location")),
      duration: String(f.get("duration")),
      description: String(f.get("description")),
      compensation: String(f.get("compensation")),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Your opportunity is published.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["workspace"] });
      qc.invalidateQueries({ queryKey: ["catalog"] });
    }
  }
  async function update(
    id: string,
    status: "submitted" | "shortlisted" | "accepted" | "declined" | "completed",
  ) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Application status updated");
      qc.invalidateQueries({ queryKey: ["workspace"] });
    }
  }
  return (
    <WorkspaceShell title="Employer Dashboard">
      <PageHeading
        title="Great talent starts with an open door."
        subtitle="Discover skilled professionals and create meaningful opportunities."
        action={
          ws.role === "employer" ? (
            <Button onClick={() => setOpen(true)}>
              <Plus />
              Post an opportunity
            </Button>
          ) : undefined
        }
      />
      {ws.role !== "employer" ? (
        <p className="empty-state">
          This workspace is for employer accounts. Your professional tools are available in
          Overview.
        </p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              ["Your opportunities", ws.opportunities.length],
              [
                "Applications received",
                ws.applications.filter((a) =>
                  ws.opportunities.some((o) => o.id === a.opportunity_id),
                ).length,
              ],
              ["Talent in discovery", ws.candidates.length],
            ].map(([label, value]) => (
              <div key={label} className="stat">
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
              </div>
            ))}
          </div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-lg bg-navy p-7 text-on-dark">
            <div>
              <h2 className="text-xl">See the skills. Discover the potential.</h2>
              <p className="mt-3 text-xs text-on-dark/70">
                Meet professionals ready to bring experience and fresh perspectives to your team.
              </p>
            </div>
            <Button asChild variant="hero">
              <Link to="/candidates">
                <Users />
                Discover Talent
              </Link>
            </Button>
          </div>
          <h2 className="mb-5 text-base">Your published opportunities</h2>
          <div className="mb-8 rounded-md border bg-card">
            {ws.opportunities.length ? (
              ws.opportunities.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold">{o.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {o.company} · {o.kind} · {o.location}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("opportunities")
                        .update({ status: o.status === "open" ? "closed" : "open" })
                        .eq("id", o.id);
                      if (error) toast.error(error.message);
                      else {
                        qc.invalidateQueries({ queryKey: ["workspace"] });
                        qc.invalidateQueries({ queryKey: ["catalog"] });
                      }
                    }}
                  >
                    {o.status === "open" ? "Close posting" : "Reopen posting"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                Your first opportunity could change someone’s next chapter.
                <br />
                <Button variant="link" className="mt-3" onClick={() => setOpen(true)}>
                  <Plus />
                  Create a posting
                </Button>
              </div>
            )}
          </div>
          <h2 className="mb-5 text-base">Application management</h2>
          <div className="space-y-4">
            {ws.applications
              .filter((a) => ws.opportunities.some((o) => o.id === a.opportunity_id))
              .map((a) => (
                <article className="content-panel" key={a.id}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm">
                        {ws.candidates.find((c) => c.id === a.user_id)?.full_name ||
                          "Professional · profile private"}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {ws.opportunities.find((o) => o.id === a.opportunity_id)?.title}
                      </p>
                    </div>
                    <select
                      aria-label="Application status"
                      className="filter-input"
                      value={a.status}
                      onChange={(e) =>
                        update(
                          a.id,
                          e.target.value as
                            "submitted" | "shortlisted" | "accepted" | "declined" | "completed",
                        )
                      }
                    >
                      {["submitted", "shortlisted", "accepted", "declined", "completed"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                  </div>
                  <p className="mt-4 text-xs leading-6">{a.cover_note}</p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const { error } = await supabase
                        .from("applications")
                        .update({
                          feedback: String(f.get("feedback")),
                          reference: String(f.get("reference")),
                        })
                        .eq("id", a.id);
                      if (error) toast.error(error.message);
                      else {
                        toast.success("Feedback and reference saved");
                        qc.invalidateQueries({ queryKey: ["workspace"] });
                      }
                    }}
                    className="mt-5 grid gap-4 sm:grid-cols-2"
                  >
                    <label className="field">
                      Supervisor feedback
                      <textarea name="feedback" defaultValue={a.feedback} />
                    </label>
                    <label className="field">
                      Professional reference
                      <textarea name="reference" defaultValue={a.reference} />
                    </label>
                    <Button type="submit" variant="outline" className="justify-self-start">
                      Save feedback & reference
                    </Button>
                  </form>
                </article>
              ))}
            {!ws.applications.some((a) =>
              ws.opportunities.some((o) => o.id === a.opportunity_id),
            ) && (
              <div className="empty-state rounded-md border bg-card">
                Applications will appear here when professionals apply to your postings.
              </div>
            )}
          </div>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>Create an opportunity</DialogTitle>
          <DialogDescription>
            A meaningful project or role can be the start of a new career.
          </DialogDescription>
          <form onSubmit={publish} className="grid gap-4 sm:grid-cols-2">
            <label className="field sm:col-span-2">
              Opportunity title
              <input name="title" required maxLength={150} />
            </label>
            <label className="field">
              Organization
              <input name="company" required />
            </label>
            <label className="field">
              Type
              <select name="kind">
                {["Job", "Internship", "Project", "Volunteering", "Challenge"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Industry
              <select name="industry">
                {["Technology", "Design", "Marketing", "Data"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Location
              <input name="location" required defaultValue="Remote" />
            </label>
            <label className="field">
              Duration
              <input name="duration" required placeholder="e.g. 4 weeks" />
            </label>
            <label className="field">
              Compensation / benefits
              <input name="compensation" placeholder="Paid, reference, portfolio…" />
            </label>
            <label className="field sm:col-span-2">
              Skills (comma separated)
              <input name="skills" required placeholder="React, JavaScript" />
            </label>
            <label className="field sm:col-span-2">
              Description
              <textarea name="description" required minLength={30} />
            </label>
            <Button type="submit" className="sm:col-span-2" disabled={busy}>
              <Plus />
              {busy ? "Publishing…" : "Publish opportunity"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}
type Candidate = Workspace["candidates"][number] | Workspace["demoCandidates"][number];
export function CandidatesPage() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const qc = useQueryClient();
  const candidates: Candidate[] = [
    ...ws.candidates.filter((c) => c.visible_to_employers),
    ...ws.demoCandidates,
  ];
  const filtered = candidates.filter(
    (c) =>
      `${c.full_name} ${c.skills.join(" ")} ${c.headline} ${c.experience}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (location === "All locations" || c.location === location),
  );
  const isDemo = (c: Candidate) => !("visible_to_employers" in c);
  async function shortlist(c: Candidate) {
    if (isDemo(c)) return;
    const { error } = await supabase
      .from("candidate_shortlists")
      .insert({ employer_id: ws.userId, candidate_id: c.id });
    if (error)
      toast.error(
        error.code === "23505" ? "This professional is already shortlisted." : error.message,
      );
    else {
      toast.success("Professional added to your private shortlist");
      setShortlisted([...shortlisted, c.id]);
    }
  }
  async function cv(c: Candidate) {
    const { data: doc, error } = await supabase
      .from("profile_documents")
      .select("cv_path")
      .eq("user_id", c.id)
      .maybeSingle();
    if (error || !doc) {
      toast.error("No CV has been shared by this professional.");
      return;
    }
    const signed = await supabase.storage.from("professional-cvs").createSignedUrl(doc.cv_path, 60);
    if (signed.error) toast.error(signed.error.message);
    else if (signed.data) window.open(signed.data.signedUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <WorkspaceShell title="Discover Talent">
      <PageHeading
        title="Talent beyond borders."
        subtitle="Discover professionals by skills and experience, not by background."
      />
      {ws.role !== "employer" ? (
        <p className="empty-state">Candidate discovery is available to employer accounts.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <label className="relative min-w-60 flex-1">
              <Search size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
              <input
                aria-label="Search candidates"
                className="filter-input w-full pl-10"
                placeholder="Search by skills, role or experience…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              className="filter-input"
              aria-label="Candidate location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {["All locations", ...new Set(candidates.map((c) => c.location))].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <p className="mb-5 text-xs text-muted-foreground">
            {filtered.length} professionals · Sample profiles are labeled
          </p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c, i) => (
              <article className="content-panel" key={c.id}>
                <div className="flex items-start justify-between">
                  <Avatar name={c.full_name} tone={i % 4} />
                  {isDemo(c) && <span className="tag">Sample profile</span>}
                </div>
                <h2 className="mt-5 text-lg">{c.full_name}</h2>
                <p className="mt-1 text-xs font-medium text-primary">{c.headline}</p>
                <p className="mt-3 text-xs text-muted-foreground">{c.location}</p>
                <p className="my-4 text-xs leading-6 text-muted-foreground">{c.summary}</p>
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setSelected(c)}>
                  <Users />
                  View professional profile
                </Button>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p className="empty-state">No professionals match your current search.</p>
          )}
        </>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>{selected?.full_name}</DialogTitle>
          <DialogDescription>
            {selected?.headline} · {selected?.location}
          </DialogDescription>
          {selected && (
            <>
              <p className="text-sm leading-7">{selected.summary}</p>
              <h3 className="text-sm">Experience</h3>
              <p className="text-xs leading-6">{selected.experience || "Not provided yet"}</p>
              {"education" in selected && (
                <>
                  <h3 className="text-sm">Education</h3>
                  <p className="text-xs leading-6">{selected.education || "Not provided yet"}</p>
                </>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.skills.map((s) => (
                  <span className="tag" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              {isDemo(selected) ? (
                <p className="text-xs text-muted-foreground">
                  Sample professional profile. This is not a real person or account.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => shortlist(selected)}
                      disabled={shortlisted.includes(selected.id)}
                    >
                      <Star />
                      {shortlisted.includes(selected.id) ? "Shortlisted" : "Shortlist candidate"}
                    </Button>
                    <Button variant="outline" onClick={() => cv(selected)}>
                      <FileText />
                      View CV
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/messages" search={{ contact: selected.id }}>
                        <MessageSquare />
                        Message
                      </Link>
                    </Button>
                  </div>
                  {"portfolio_url" in selected && selected.portfolio_url && (
                    <a
                      href={selected.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary"
                    >
                      View portfolio <ExternalLink size={13} />
                    </a>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}
