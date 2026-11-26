import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/talentbridge/shell";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "Privacy & inclusion",
      "Your skills, your story and your choice. Learn how TalentBridge protects your information.",
    ),
  component: Privacy,
});
function Privacy() {
  return (
    <PublicShell>
      <main className="container-wide section max-w-3xl">
        <p className="section-eyebrow">Privacy & inclusion</p>
        <h1 className="section-title">Your profile. Your choice.</h1>
        {[
          [
            "Skills first, always",
            "We prioritize your professional skills, experience and potential. We do not request or display refugee status, nationality, immigration documents or sensitive displacement information.",
          ],
          [
            "Employer visibility is optional",
            "Your profile is private by default. Turn on employer visibility in your profile only when you’re ready. Turning it off removes your profile and CV from employer discovery.",
          ],
          [
            "Private documents",
            "CVs are stored privately. Only you, and signed-in employers when you allow profile visibility, can access your CV. Do not include sensitive personal information in a CV or portfolio you choose to share.",
          ],
          [
            "Your requests and conversations",
            "Applications and mentorship requests are visible only to you and the relevant opportunity owner or mentor. Messages are visible only to participants.",
          ],
          [
            "Demonstration content",
            "Illustrative mentor, opportunity and candidate records are labeled as sample data. Requests and applications to sample records are saved, but no external person or organization is contacted.",
          ],
          [
            "A respectful community",
            "Every professional background is welcome. Communicate respectfully, evaluate abilities fairly and never use personal displacement history to discriminate.",
          ],
        ].map(([t, d]) => (
          <section key={t} className="mt-9">
            <h2 className="text-lg">{t}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{d}</p>
          </section>
        ))}
      </main>
    </PublicShell>
  );
}
