import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  GraduationCap,
  House,
  LibraryBig,
  MessageSquareText,
  Settings,
  Target,
  UsersRound,
} from "lucide-react";
import "../_group.css";

type Role = "student" | "teacher" | "admin";
type NavItem = { id: string; label: string; icon: typeof House };

const navigation: Record<Role, NavItem[]> = {
  student: [
    { id: "home", label: "الرئيسية", icon: House },
    { id: "learning", label: "التعلّم", icon: BookOpen },
    { id: "classes", label: "الحصص", icon: CalendarDays },
    { id: "feedback", label: "Feedback", icon: MessageSquareText },
    { id: "homework", label: "الواجبات", icon: CheckSquare },
    { id: "goals", label: "أهدافي", icon: Target },
  ],
  teacher: [
    { id: "home", label: "نظرة عامة", icon: House },
    { id: "classes", label: "الحصص", icon: CalendarDays },
    { id: "students", label: "الطلاب", icon: UsersRound },
    { id: "feedback", label: "Feedback", icon: MessageSquareText },
    { id: "homework", label: "Homework", icon: ClipboardCheck },
    { id: "resources", label: "مصادر التعلّم", icon: LibraryBig },
  ],
  admin: [
    { id: "home", label: "نظرة عامة", icon: House },
    { id: "people", label: "الأشخاص", icon: UsersRound },
    { id: "levels", label: "المستويات والمحتوى", icon: GraduationCap },
    { id: "classes", label: "الحصص", icon: CalendarDays },
    { id: "feedback", label: "Feedback", icon: MessageSquareText },
    { id: "reports", label: "التقارير", icon: BarChart3 },
  ],
};

const roleLabel: Record<Role, string> = {
  student: "مساحة الطالب",
  teacher: "مساحة المدرس",
  admin: "الإدارة",
};

const identity: Record<Role, { name: string; initials: string }> = {
  student: { name: "ليان", initials: "ل" },
  teacher: { name: "نورا العتيبي", initials: "ن" },
  admin: { name: "مريم أحمد", initials: "م" },
};

type AppLayoutProps = {
  role: Role;
  active: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Be Fluent">
      <img
        src="/__mockup/images/be-fluent-mark-2026.png"
        alt=""
        className="h-10 w-9 object-contain"
      />
      <span className="bf-brand-name text-[15px] font-semibold text-[var(--bf-purple)]">
        Be Fluent
      </span>
    </div>
  );
}

export function AppLayout({
  role,
  active,
  title,
  subtitle,
  children,
}: AppLayoutProps) {
  const items = navigation[role];
  const profile = identity[role];

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-[var(--bf-canvas)] text-[var(--bf-ink)]"
    >
      <aside className="fixed inset-y-0 right-0 z-20 hidden w-[244px] flex-col border-l border-[var(--bf-line)] bg-[var(--bf-paper)] px-5 py-6 lg:flex">
        <Brand />
        <p className="mb-3 mt-10 px-3 text-xs font-medium text-[var(--bf-muted)]">
          {roleLabel[role]}
        </p>
        <nav aria-label="التنقل الرئيسي" className="space-y-1">
          {items.map(({ id, label, icon: Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-right text-sm transition-colors ${
                  selected
                    ? "bg-[var(--bf-green-soft)] font-semibold text-[var(--bf-green)]"
                    : "text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)] hover:text-[var(--bf-ink)]"
                }`}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-[var(--bf-line)] pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bf-purple-soft)] text-xs font-semibold text-[var(--bf-purple)]">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-[var(--bf-muted)]">{roleLabel[role]}</p>
            </div>
            <Settings aria-hidden="true" className="mr-auto h-4 w-4 text-[var(--bf-muted)]" />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pr-[244px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[var(--bf-line)] bg-[var(--bf-paper)]/95 px-4 backdrop-blur-sm md:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-[var(--bf-muted)]">{roleLabel[role]}</p>
            <p className="mt-0.5 text-sm font-semibold">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[var(--bf-muted)] sm:inline">عربي</span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-[var(--bf-line)] sm:inline-block" />
            <span className="hidden text-xs text-[var(--bf-muted)] sm:inline">EN</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bf-purple-soft)] text-xs font-semibold text-[var(--bf-purple)]">
              {profile.initials}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 md:px-8 md:pt-8 lg:pb-10">
          <div className="mb-6 lg:hidden">
            <p className="text-xs text-[var(--bf-muted)]">{roleLabel[role]}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-[var(--bf-muted)]">{subtitle}</p>
            ) : null}
          </div>
          <div className="hidden lg:block">
            {subtitle ? (
              <p className="mb-6 text-sm leading-6 text-[var(--bf-muted)]">{subtitle}</p>
            ) : (
              <div className="mb-6" />
            )}
          </div>
          {children}
        </main>
      </div>

      <nav
        aria-label="التنقل على الهاتف"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--bf-line)] bg-[var(--bf-paper)] px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 lg:hidden"
      >
        {items.slice(0, 4).map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] ${
                selected ? "font-semibold text-[var(--bf-green)]" : "text-[var(--bf-muted)]"
              }`}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              <span className="max-w-full truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}