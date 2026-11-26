import { useState, type FormEvent } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, MessageSquare, Send, Users, CheckCheck, Bell } from "lucide-react";
import { WorkspaceShell, PageHeading, Avatar } from "./shell";
import { Button } from "@/components/ui/button";
import { workspaceQuery, catalogQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
export function MentorDashboard() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const qc = useQueryClient();
  const mentor = catalog.mentors.find((m) => m.user_id === ws.userId);
  const requests = ws.requests.filter((r) => r.mentor_id === mentor?.id);
  async function decision(id: string, status: "accepted" | "declined") {
    const { error } = await supabase.from("mentor_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Request ${status}`);
      qc.invalidateQueries({ queryKey: ["workspace"] });
    }
  }
  return (
    <WorkspaceShell title="Mentor Dashboard">
      <PageHeading
        title="Your experience can open a door."
        subtitle="Support professionals as they navigate their next chapter."
        action={
          <Button asChild variant="outline">
            <Link to="/profile">Edit mentor profile</Link>
          </Button>
        }
      />
      {ws.role !== "mentor" ? (
        <p className="empty-state">Mentor tools are available to registered mentors.</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              ["Requests received", requests.length],
              ["Active connections", requests.filter((r) => r.status === "accepted").length],
              ["Sessions scheduled", requests.filter((r) => r.session_at).length],
            ].map(([t, v]) => (
              <div className="stat" key={t}>
                <p className="stat-label">{t}</p>
                <p className="stat-value">{v}</p>
              </div>
            ))}
          </div>
          <h2 className="mb-5 text-base">Mentorship requests</h2>
          <div className="space-y-5">
            {requests.map((r) => {
              const person = ws.candidates.find((c) => c.id === r.user_id);
              return (
                <article className="content-panel" key={r.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={person?.full_name || "Professional"} />
                      <div>
                        <h3 className="text-sm">{person?.full_name || "Professional"}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{person?.headline}</p>
                      </div>
                    </div>
                    <span className="status-tag">{r.status}</span>
                  </div>
                  <p className="mt-5 text-sm leading-7">{r.message}</p>
                  {r.status === "pending" && (
                    <div className="mt-5 flex gap-3">
                      <Button onClick={() => decision(r.id, "accepted")}>
                        <Check />
                        Accept request
                      </Button>
                      <Button variant="outline" onClick={() => decision(r.id, "declined")}>
                        Decline
                      </Button>
                    </div>
                  )}
                  {r.status === "accepted" && (
                    <form
                      className="mt-5 space-y-4 border-t pt-5"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        const session = String(f.get("session"));
                        const { error } = await supabase
                          .from("mentor_requests")
                          .update({
                            session_at: session ? new Date(session).toISOString() : null,
                            feedback: String(f.get("feedback")),
                          })
                          .eq("id", r.id);
                        if (error) toast.error(error.message);
                        else {
                          toast.success("Session and feedback saved");
                          qc.invalidateQueries({ queryKey: ["workspace"] });
                        }
                      }}
                    >
                      <label className="field">
                        Session date & time (your local time)
                        <input
                          type="datetime-local"
                          name="session"
                          required
                          defaultValue={
                            r.session_at
                              ? new Date(
                                  new Date(r.session_at).getTime() -
                                    new Date().getTimezoneOffset() * 60000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                        />
                      </label>
                      <label className="field">
                        Career feedback
                        <textarea name="feedback" defaultValue={r.feedback} />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <Button type="submit">
                          <CalendarDays />
                          Save session & feedback
                        </Button>
                        <Button asChild variant="outline">
                          <Link to="/messages" search={{ contact: r.user_id }}>
                            <MessageSquare />
                            Message professional
                          </Link>
                        </Button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
            {!requests.length && (
              <div className="empty-state rounded-md border bg-card">
                <Users size={28} className="mx-auto mb-4" />
                Your mentorship requests will appear here.
                <br />
                <Link className="mt-3 inline-block text-primary" to="/profile">
                  Complete your mentor profile to help professionals find you.
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </WorkspaceShell>
  );
}
export function MessagesPage({ initialContact }: { initialContact?: string }) {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const [contact, setContact] = useState(initialContact ?? "");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const contacts = new Map(
    ws.candidates.map((p) => [p.id, p.full_name || p.headline || "Professional"]),
  );
  catalog.mentors
    .filter((m) => m.user_id)
    .forEach((m) => {
      if (m.user_id && m.user_id !== ws.userId) contacts.set(m.user_id, m.name);
    });
  ws.messages.forEach((m) => {
    const other = m.sender_id === ws.userId ? m.recipient_id : m.sender_id;
    if (!contacts.has(other)) contacts.set(other, "Professional contact");
  });
  const conversation = ws.messages.filter(
    (m) =>
      (m.sender_id === ws.userId && m.recipient_id === contact) ||
      (m.recipient_id === ws.userId && m.sender_id === contact),
  );
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!contact) return;
    setBusy(true);
    const form = e.currentTarget;
    const body = String(new FormData(form).get("body")).trim();
    if (!body) {
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: ws.userId, recipient_id: contact, body });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      form.reset();
      await qc.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Message sent");
    }
  }
  return (
    <WorkspaceShell title="Messages">
      <PageHeading
        title="Meaningful connections start here."
        subtitle="Keep your professional conversations in one place."
        action={
          <Button
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ["workspace"] })}
          >
            Refresh messages
          </Button>
        }
      />
      <div className="grid min-h-[550px] overflow-hidden rounded-lg border bg-card md:grid-cols-[260px_1fr]">
        <aside className="border-b p-4 md:border-b-0 md:border-r">
          <label className="field">
            Choose a professional contact
            <select
              aria-label="Message contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            >
              <option value="">Select a contact</option>
              {[...contacts.entries()]
                .filter(([id]) => id !== ws.userId)
                .map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
            </select>
          </label>
          <div className="mt-6 space-y-2">
            {[
              ...new Set(
                ws.messages.map((m) => (m.sender_id === ws.userId ? m.recipient_id : m.sender_id)),
              ),
            ].map((id) => (
              <Button
                key={id}
                variant={contact === id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setContact(id)}
              >
                <MessageSquare />
                {contacts.get(id) || "Contact"}
              </Button>
            ))}
          </div>
          <p className="mt-7 text-[11px] leading-6 text-muted-foreground">
            Only real registered accounts can receive messages. Sample mentor profiles are not
            message recipients.
          </p>
        </aside>
        <div className="flex flex-col">
          <div className="border-b px-6 py-5 text-sm font-medium">
            {contacts.get(contact) || "Your conversations"}
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            {conversation.map((m) => (
              <div className="message-bubble" data-own={m.sender_id === ws.userId} key={m.id}>
                <p>{m.body}</p>
                <p className="mt-2 text-[9px] text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
            {!conversation.length && (
              <div className="empty-state my-auto">
                <MessageSquare className="mx-auto mb-4" size={32} />
                {contact
                  ? "Say hello and start a professional conversation."
                  : "Select a contact to start a conversation."}
              </div>
            )}
          </div>
          <form onSubmit={send} className="flex items-center gap-3 border-t p-4">
            <input
              className="filter-input flex-1"
              name="body"
              aria-label="Message"
              placeholder="Write a thoughtful message…"
              maxLength={5000}
              required
              disabled={!contact}
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={!contact || busy}>
              <Send />
            </Button>
          </form>
        </div>
      </div>
    </WorkspaceShell>
  );
}
export function NotificationsPage() {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const qc = useQueryClient();
  async function mark(id?: string) {
    let query = supabase.from("notifications").update({ read: true }).eq("user_id", ws.userId);
    if (id) query = query.eq("id", id);
    const { error } = await query;
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["workspace"] });
  }
  return (
    <WorkspaceShell title="Notifications">
      <PageHeading
        title="You’re moving forward."
        subtitle="Updates on your applications, mentorship and conversations."
        action={
          <Button variant="outline" onClick={() => mark()}>
            <CheckCheck />
            Mark all read
          </Button>
        }
      />
      <div className="rounded-md border bg-card">
        {ws.notifications.map((n) => (
          <article key={n.id} className="flex items-start gap-4 border-b p-5 last:border-0">
            <span
              className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full ${n.read ? "bg-muted text-muted-foreground" : "bg-secondary text-primary"}`}
            >
              <Bell size={17} />
            </span>
            <div className="flex-1">
              <h2 className="text-sm">{n.title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {new Date(n.created_at).toLocaleString("en-GB")}
              </p>
            </div>
            {!n.read && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mark notification read"
                onClick={() => mark(n.id)}
              >
                <Check />
              </Button>
            )}
          </article>
        ))}
        {!ws.notifications.length && <p className="empty-state">You’re all caught up.</p>}
      </div>
    </WorkspaceShell>
  );
}
