import { useState, type FormEvent } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Save, ShieldCheck, Upload, ExternalLink } from "lucide-react";
import { WorkspaceShell, PageHeading, Avatar } from "./shell";
import { Button } from "@/components/ui/button";
import { workspaceQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const split = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export const MAX_CV_BYTES = 10 * 1024 * 1024;
export function ProfilePage() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const p = ws.profile;
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(p?.visible_to_employers ?? false);
  const qc = useQueryClient();
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const file = f.get("cv");
    try {
      const portfolio = String(f.get("portfolio_url") ?? "").trim();
      if (portfolio && !/^https:\/\//i.test(portfolio))
        throw new Error("Portfolio links must begin with https://");
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: ws.userId,
          full_name: String(f.get("full_name")),
          headline: String(f.get("headline")),
          location: String(f.get("location")),
          summary: String(f.get("summary")),
          skills: split(f.get("skills")),
          education: String(f.get("education")),
          experience: String(f.get("experience")),
          languages: split(f.get("languages")),
          certifications: String(f.get("certifications")),
          portfolio_url: portfolio,
          interests: split(f.get("interests")),
          visible_to_employers: visible,
        });
      if (error) throw error;
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_CV_BYTES) throw new Error("Please choose a CV smaller than 10 MB.");
        const path = `${ws.userId}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
        const upload = await supabase.storage.from("professional-cvs").upload(path, file);
        if (upload.error) throw upload.error;
        const document = await supabase
          .from("profile_documents")
          .upsert({ user_id: ws.userId, cv_path: path });
        if (document.error) throw document.error;
      }
      if (ws.role === "mentor") {
        const result = await supabase
          .from("mentors")
          .update({
            name: String(f.get("full_name")),
            title: String(f.get("headline")),
            location: String(f.get("location")),
            bio: String(f.get("summary")),
            skills: split(f.get("skills")),
            industry: String(f.get("industry")),
            years_experience: Number(f.get("years_experience")) || 5,
          })
          .eq("user_id", ws.userId);
        if (result.error) throw result.error;
      }
      await qc.invalidateQueries({ queryKey: ["workspace"] });
      await qc.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Your professional profile is saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }
  async function viewCv() {
    if (!ws.documents) return;
    const { data, error } = await supabase.storage
      .from("professional-cvs")
      .createSignedUrl(ws.documents.cv_path, 60);
    if (error) toast.error(error.message);
    else if (data) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <WorkspaceShell title="My Profile">
      <PageHeading
        title="Let your experience speak."
        subtitle="Your professional story, brought together in one place."
      />
      <div className="mb-7 flex items-center gap-5">
        <Avatar name={p?.full_name || "Your Name"} />
        <div>
          <p className="font-semibold">{p?.full_name || "Your professional profile"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {p?.headline || "Add a headline that reflects your strengths."}
          </p>
        </div>
      </div>
      <form onSubmit={save} className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-5 border-b pb-3 text-base">The essentials</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                Full name
                <input name="full_name" required defaultValue={p?.full_name} />
              </label>
              <label className="field">
                Professional headline
                <input
                  name="headline"
                  required
                  placeholder="e.g. Product Designer"
                  defaultValue={p?.headline}
                />
              </label>
              <label className="field">
                Location
                <input name="location" placeholder="City, country" defaultValue={p?.location} />
              </label>
              <label className="field">
                Languages
                <input
                  name="languages"
                  placeholder="English, Arabic, French"
                  defaultValue={p?.languages.join(", ")}
                />
              </label>
              <label className="field sm:col-span-2">
                Professional summary
                <textarea
                  name="summary"
                  defaultValue={p?.summary}
                  placeholder="Share your experience, strengths and ambitions…"
                />
              </label>
            </div>
          </section>
          <section>
            <h2 className="mb-5 border-b pb-3 text-base">Skills & experience</h2>
            <div className="space-y-5">
              <label className="field">
                Skills (comma separated)
                <input
                  name="skills"
                  defaultValue={p?.skills.join(", ")}
                  placeholder="React, JavaScript, Figma, UI/UX Design"
                />
              </label>
              <label className="field">
                Career interests (comma separated)
                <input
                  name="interests"
                  defaultValue={p?.interests.join(", ")}
                  placeholder="Technology, Design, Data, Marketing"
                />
              </label>
              <label className="field">
                Work experience
                <textarea
                  name="experience"
                  defaultValue={p?.experience}
                  placeholder="Previous roles, organizations, years and achievements"
                />
              </label>
              <label className="field">
                Education
                <textarea
                  name="education"
                  defaultValue={p?.education}
                  placeholder="Degrees, institutions and qualifications"
                />
              </label>
              <label className="field">
                Certifications
                <input name="certifications" defaultValue={p?.certifications} />
              </label>
            </div>
          </section>
          {ws.role === "mentor" && (
            <section>
              <h2 className="mb-5 border-b pb-3 text-base">Mentor expertise</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  Industry
                  <select name="industry">
                    {["Technology", "Design", "Data", "Marketing"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Years of experience
                  <input type="number" name="years_experience" min="0" max="70" defaultValue={5} />
                </label>
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-5 border-b pb-3 text-base">CV & portfolio</h2>
            <label className="field">
              Portfolio URL
              <input
                type="url"
                name="portfolio_url"
                placeholder="https://your-portfolio.com"
                defaultValue={p?.portfolio_url}
              />
            </label>
            <label className="field mt-5">
              <span className="flex items-center gap-2">
                <Upload size={16} /> Upload CV · PDF or Word · up to 10 MB
              </span>
              <input type="file" name="cv" accept=".pdf,.doc,.docx" />
            </label>
            {ws.documents && (
              <Button type="button" variant="outline" className="mt-4" onClick={viewCv}>
                <FileText />
                View saved CV <ExternalLink />
              </Button>
            )}
          </section>
          <Button type="submit" size="lg" disabled={busy}>
            <Save />
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
        <aside>
          <div className="rounded-md border border-primary/20 bg-secondary p-6">
            <ShieldCheck size={26} className="mb-4 text-primary" />
            <h2 className="text-base">Your privacy comes first.</h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              You choose whether employers can discover your profile and access your CV. Your
              displacement status is never requested.
            </p>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs font-medium">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              Make my profile and CV visible to employers
            </label>
            <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
              Visibility changes take effect when you save your profile.
            </p>
          </div>
        </aside>
      </form>
    </WorkspaceShell>
  );
}
