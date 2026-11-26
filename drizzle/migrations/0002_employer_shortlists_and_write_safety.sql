CREATE TABLE public.candidate_shortlists (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, candidate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(employer_id,candidate_id));
GRANT SELECT,INSERT,DELETE ON public.candidate_shortlists TO authenticated; GRANT ALL ON public.candidate_shortlists TO service_role;
ALTER TABLE public.candidate_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_shortlists ON public.candidate_shortlists FOR ALL TO authenticated USING(employer_id=auth.uid()) WITH CHECK(employer_id=auth.uid() AND public.has_role(auth.uid(),'employer') AND EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=candidate_id AND p.visible_to_employers));
REVOKE UPDATE ON public.applications FROM authenticated; GRANT UPDATE(status,feedback,reference) ON public.applications TO authenticated;
REVOKE UPDATE ON public.mentor_requests FROM authenticated; GRANT UPDATE(status,session_at,feedback) ON public.mentor_requests TO authenticated;
REVOKE UPDATE ON public.notifications FROM authenticated; GRANT UPDATE(read) ON public.notifications TO authenticated;
CREATE POLICY conversation_profile_read ON public.profiles FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.messages m WHERE (m.sender_id=auth.uid() AND m.recipient_id=profiles.id) OR (m.recipient_id=auth.uid() AND m.sender_id=profiles.id)));
CREATE INDEX shortlist_candidate_idx ON public.candidate_shortlists(candidate_id);