import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  Sparkles,
  UserRound,
  Users,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { workspaceQuery } from "@/lib/queries";
export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-icon">
        <Network size={24} />
      </span>
      <span>
        Talent<span>Bridge</span>
      </span>
    </Link>
  );
}
export function Avatar({ name, tone = 0 }: { name: string; tone?: number }) {
  return (
    <span className="person-avatar" data-tone={String(tone)}>
      {name
        .split(" ")
        .slice(0, 2)
        .map((s) => s.charAt(0))
        .join("") || "TB"}
    </span>
  );
}
export function PublicHeader() {
  const { data: user } = useUser();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <div className="container-wide flex items-center justify-between gap-5">
          <Brand />
          <nav className="desktop-nav flex items-center gap-7">
            <Link className="nav-link" to="/">
              Home
            </Link>
            <Link className="nav-link" to="/about">
              About us
            </Link>
            <Link className="nav-link" to="/mentors">
              Find a Mentor
            </Link>
            <Link className="nav-link" to="/experience">
              Experience Hub
            </Link>
            <Link className="nav-link" to="/opportunities">
              Opportunities
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">
                  My workspace <ArrowUpRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">
                    Get Started <ArrowUpRight />
                  </Link>
                </Button>
              </>
            )}
            <Button
              aria-label="Open navigation"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="flex flex-col gap-4 border-b bg-background px-6 py-5 md:hidden">
          <Link to="/about" onClick={() => setOpen(false)}>
            About us
          </Link>
          <Link to="/mentors" onClick={() => setOpen(false)}>
            Find a Mentor
          </Link>
          <Link to="/experience" onClick={() => setOpen(false)}>
            Experience Hub
          </Link>
          <Link to="/opportunities" onClick={() => setOpen(false)}>
            Opportunities
          </Link>
          <Link to="/auth" onClick={() => setOpen(false)}>
            Log in
          </Link>
        </nav>
      )}
    </>
  );
}
export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="container-wide flex flex-wrap items-center justify-between gap-6">
        <div>
          <Brand />
          <p className="mt-3 text-xs text-muted-foreground">Your Skills Deserve an Opportunity.</p>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link to="/about">Our mission</Link>
          <Link to="/privacy">Privacy & inclusion</Link>
          <span>© 2026 TalentBridge</span>
        </div>
      </div>
    </footer>
  );
}
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
const nav = [
  { to: "/dashboard" as const, label: "Overview", icon: LayoutDashboard },
  { to: "/profile" as const, label: "My Profile", icon: UserRound },
  { to: "/mentors" as const, label: "MentorConnect", icon: Users },
  { to: "/experience" as const, label: "Experience Hub", icon: Compass },
  { to: "/opportunities" as const, label: "Opportunities", icon: BriefcaseBusiness },
  { to: "/recommendations" as const, label: "Career Matches", icon: Sparkles },
  { to: "/messages" as const, label: "Messages", icon: MessageSquare },
];
export function WorkspaceShell({ children, title }: { children: ReactNode; title: string }) {
  const { data: ws } = useSuspenseQuery(workspaceQuery);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="workspace">
      <aside className="sidebar" data-open={open}>
        <div className="flex items-center justify-between">
          <Brand />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Close navigation"
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <p className="mb-5 mt-9 px-4 text-[10px] font-semibold uppercase text-muted-foreground">
          Your next chapter
        </p>
        <nav>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="side-link"
              data-active={path === item.to}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          {ws.role === "employer" && (
            <>
              <Link to="/employer" className="side-link" data-active={path === "/employer"}>
                <BriefcaseBusiness size={18} />
                Employer Dashboard
              </Link>
              <Link to="/candidates" className="side-link" data-active={path === "/candidates"}>
                <Users size={18} />
                Discover Talent
              </Link>
            </>
          )}
          {ws.role === "mentor" && (
            <Link
              to="/mentor-dashboard"
              className="side-link"
              data-active={path === "/mentor-dashboard"}
            >
              <Users size={18} />
              Mentor Dashboard
            </Link>
          )}
        </nav>
        <div className="mt-auto">
          <div className="mb-6 rounded-md bg-secondary p-4">
            <ShieldCheck size={22} className="mb-2 text-primary" />
            <p className="text-xs font-semibold">Your skills. Your story.</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              You decide what employers can see.
            </p>
            <Link to="/profile" className="mt-3 flex items-center gap-1 text-[11px] text-primary">
              Privacy settings <ChevronRight size={13} />
            </Link>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open workspace navigation"
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-5">
            <Button asChild size="icon" variant="ghost" aria-label="Notifications">
              <Link to="/notifications" className="relative">
                <Bell />
                {ws.notifications.some((n) => !n.read) && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
                )}
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar name={ws.profile?.full_name || "Professional"} />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold">{ws.profile?.full_name || "Your account"}</p>
                <p className="mt-1 text-[10px] capitalize text-muted-foreground">{ws.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="workspace-body">{children}</main>
      </div>
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
