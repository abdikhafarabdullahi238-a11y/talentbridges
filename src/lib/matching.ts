export type MatchProfile = {
  skills: string[];
  interests: string[];
  location: string;
  experience: string;
};
export type MatchTarget = { skills: string[]; industry: string; location: string };
export function matchCareer(profile: MatchProfile, target: MatchTarget) {
  const normalize = (s: string) => s.trim().toLowerCase();
  const overlap = target.skills.filter((skill) =>
    profile.skills.some((s) => normalize(s) === normalize(skill)),
  );
  const interest = profile.interests.some((s) => normalize(s) === normalize(target.industry));
  const local =
    Boolean(profile.location.trim()) && normalize(profile.location) === normalize(target.location);
  const remote = normalize(target.location) === "remote";
  const experienced = /[1-9]/.test(profile.experience);
  const score = Math.min(
    100,
    Math.round(
      (overlap.length / Math.max(target.skills.length, 1)) * 65 +
        (interest ? 15 : 0) +
        (local || remote ? 15 : 0) +
        (experienced ? 5 : 0),
    ),
  );
  const reasons = [
    overlap.length ? `Matches your ${overlap.join(", ")} skills` : "",
    interest ? `Aligned with your interest in ${target.industry}` : "",
    local ? "Based in your location" : remote ? "Remote and accessible from your location" : "",
    experienced ? "Builds on your professional experience" : "",
  ].filter(Boolean);
  return { score, reasons };
}
