import { useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  GraduationCap,
  Mail,
  Search,
  Server,
  UsersRound,
  X,
} from "lucide-react";
import { AppLayout } from "./_shared/AppLayout";

type Counts = {
  students: number;
  activeStudents: number;
  teachers: number;
  classesToday: number;
  feedbackPending: number;
  homeworkToReview: number;
};

type OperationalItem = {
  type: "coverage" | "feedback" | "homework";
  studentOrClass: string;
  owner: string;
  dueLabel: string;
  actionLabel: string;
};

type QuickAction = "people" | "levels" | "classes";

const counts: Counts = {
  students: 328,
  activeStudents: 286,
  teachers: 24,
  classesToday: 18,
  feedbackPending: 7,
  homeworkToReview: 11,
};

const operationalItems: OperationalItem[] = [
  {
    type: "coverage",
    studentOrClass: "مجموعة المحادثة · B1",
    owner: "المدرسة غير متاحة",
    dueLabel: "تبدأ بعد ٣٥ دقيقة",
    actionLabel: "تأمين التغطية",
  },
  {
    type: "coverage",
    studentOrClass: "نقاش متقدم · C1.2",
    owner: "بانتظار مدرس بديل",
    dueLabel: "تبدأ ١٢:٣٠",
    actionLabel: "اختيار بديل",
  },
  {
    type: "feedback",
    studentOrClass: "سارة منصور · حصة B1",
    owner: "أحمد علي",
    dueLabel: "منذ ١٨ ساعة",
    actionLabel: "مراجعة النشر",
  },
  {
    type: "homework",
    studentOrClass: "عمر نبيل · كتابة B2",
    owner: "مها فوزي",
    dueLabel: "موعد المراجعة اليوم",
    actionLabel: "مراجعة الواجب",
  },
  {
    type: "feedback",
    studentOrClass: "ليلى عادل · حصة A2.3",
    owner: "نور هاني",
    dueLabel: "منذ يوم واحد",
    actionLabel: "مراجعة النشر",
  },
  {
    type: "homework",
    studentOrClass: "زياد سامي · مفردات B1",
    owner: "سلمى فؤاد",
    dueLabel: "مراجعة متأخرة",
    actionLabel: "مراجعة الواجب",
  },
];

const itemMeta = {
  coverage: {
    label: "تغطية حصة",
    color: "text-[#87592e]",
    background: "bg-[#f8f0e5]",
    marker: "border-[#d7a35d]",
  },
  feedback: {
    label: "Feedback",
    color: "text-[var(--bf-purple)]",
    background: "bg-[var(--bf-purple-soft)]",
    marker: "border-[#8878ad]",
  },
  homework: {
    label: "Homework",
    color: "text-[var(--bf-green)]",
    background: "bg-[var(--bf-green-soft)]",
    marker: "border-[#5d9a78]",
  },
} as const;

const quickActionDetails: Record<
  QuickAction,
  { title: string; description: string; prompt: string; icon: typeof UsersRound }
> = {
  people: {
    title: "الأشخاص",
    description: "ابحث عن طالب أو مدرس، ثم افتح ملفه من مساحة الأشخاص.",
    prompt: "اسم الطالب أو المدرس",
    icon: UsersRound,
  },
  levels: {
    title: "المستويات والمحتوى",
    description: "انتقل إلى مستوى CEFR أو ابحث عن مادة تعليمية.",
    prompt: "مستوى أو عنوان محتوى",
    icon: GraduationCap,
  },
  classes: {
    title: "الحصص",
    description: "اعثر على حصة اليوم أو راجع تفاصيل التغطية.",
    prompt: "اسم الحصة أو المدرس",
    icon: CalendarDays,
  },
};

function getItemIcon(type: OperationalItem["type"]) {
  if (type === "coverage") return CalendarDays;
  if (type === "feedback") return BookOpen;
  return Check;
}

export function AdminOverview() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<OperationalItem | null>(null);
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [quickQuery, setQuickQuery] = useState("");
  const [quickNotice, setQuickNotice] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    if (!query) return operationalItems;
    return operationalItems.filter((item) =>
      [item.studentOrClass, item.owner, item.dueLabel, item.actionLabel, itemMeta[item.type].label]
        .join(" ")
        .toLocaleLowerCase("ar")
        .includes(query),
    );
  }, [search]);

  const openQuickAction = (action: QuickAction) => {
    setQuickAction(action);
    setQuickQuery("");
    setQuickNotice("");
  };

  const handleQuickSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickQuery.trim()) {
      setQuickNotice("أدخل كلمة للبحث للمتابعة.");
      return;
    }
    setQuickNotice(`تم تجهيز بحث محلي عن «${quickQuery.trim()}» — لا توجد تغييرات محفوظة.`);
  };

  const activeAction = quickAction ? quickActionDetails[quickAction] : null;
  const QuickIcon = activeAction?.icon;

  return (
    <AppLayout
      role="admin"
      active="home"
      title="نظرة عامة"
      subtitle="الأولوية اليوم: الحصص التي تحتاج تغطية، ثم مراجعات رحلة التعلّم."
    >
      <div className="space-y-5 md:space-y-6">
        <section
          aria-label="أولوية اليوم"
          className="overflow-hidden rounded-xl border border-[#ead9bd] bg-[#fbf6ed]"
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f2e5d1] text-[#87592e]">
                <CalendarDays aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#513c27]">حصتان تحتاجان إلى تغطية</p>
                <p className="mt-1 text-xs leading-5 text-[#806b52]">
                  أول حصة تبدأ بعد ٣٥ دقيقة. راجع المدرسين المتاحين قبل بدء اليوم.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("تغطية");
                setSelectedItem(null);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-[#dcc6a6] bg-[#fffaf2] px-3.5 text-sm font-semibold text-[#76542f] transition-colors hover:bg-white sm:self-auto"
            >
              عرض الحصص
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section aria-label="مؤشرات التشغيل" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4">
            <div className="flex items-center gap-2 text-[var(--bf-muted)]">
              <UsersRound aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-medium">الطلاب النشطون</span>
            </div>
            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums text-[var(--bf-ink)]">
              {counts.activeStudents}
              <span className="mr-1.5 text-sm font-normal text-[var(--bf-muted)]">من {counts.students}</span>
            </p>
          </article>
          <article className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4">
            <div className="flex items-center gap-2 text-[var(--bf-muted)]">
              <GraduationCap aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-medium">المدرسون</span>
            </div>
            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums text-[var(--bf-ink)]">
              {counts.teachers}
              <span className="mr-1.5 text-sm font-normal text-[var(--bf-muted)]">مدرسًا</span>
            </p>
          </article>
          <article className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4">
            <div className="flex items-center gap-2 text-[var(--bf-muted)]">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-medium">Feedback للنشر</span>
            </div>
            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums text-[var(--bf-purple)]">
              {counts.feedbackPending}
              <span className="mr-1.5 text-sm font-normal text-[var(--bf-muted)]">بانتظار المراجعة</span>
            </p>
          </article>
          <article className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4">
            <div className="flex items-center gap-2 text-[var(--bf-muted)]">
              <Check aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-medium">Homework للمراجعة</span>
            </div>
            <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums text-[var(--bf-green)]">
              {counts.homeworkToReview}
              <span className="mr-1.5 text-sm font-normal text-[var(--bf-muted)]">تسليمًا</span>
            </p>
          </article>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(270px,.75fr)] lg:gap-6">
          <section className="min-w-0 rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)]">
            <div className="flex flex-col gap-3 border-b border-[var(--bf-line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--bf-ink)]">قائمة المتابعة</h2>
                <p className="mt-1 text-xs text-[var(--bf-muted)]">المهام الأقرب للاستحقاق في رحلة التعلّم.</p>
              </div>
              <label className="relative block sm:w-[235px]">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bf-muted)]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث في المتابعة"
                  aria-label="ابحث عن طالب أو مدرس أو حصة"
                  className="min-h-11 w-full rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] py-2 pe-9 ps-3 text-sm text-[var(--bf-ink)] outline-none placeholder:text-[#89958e] focus:border-[var(--bf-green)] focus:ring-2 focus:ring-[var(--bf-green-soft)]"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="مسح البحث"
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[var(--bf-muted)] hover:bg-white"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
              </label>
            </div>

            <ul className="divide-y divide-[var(--bf-line)]">
              {filteredItems.map((item, index) => {
                const meta = itemMeta[item.type];
                const Icon = getItemIcon(item.type);
                return (
                  <li key={`${item.type}-${item.studentOrClass}`} className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.background} ${meta.color}`}
                      >
                        <Icon aria-hidden="true" className="h-[17px] w-[17px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-sm font-semibold text-[var(--bf-ink)]">
                            {item.studentOrClass}
                          </span>
                          <span className={`text-[11px] font-medium ${meta.color}`}>{meta.label}</span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[var(--bf-muted)]">
                          <span>{item.owner}</span>
                          <span aria-hidden="true" className="text-[#b4beb7]">·</span>
                          <span>{item.dueLabel}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[var(--bf-green)] transition-colors hover:bg-[var(--bf-green-soft)] sm:px-3 sm:text-sm"
                        aria-label={`${item.actionLabel}: ${item.studentOrClass}`}
                      >
                        <span className="hidden sm:inline">{item.actionLabel}</span>
                        <span className="sm:hidden">فتح</span>
                        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                    {index === 0 && item.type === "coverage" ? (
                      <span className="sr-only">أعلى أولوية</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {filteredItems.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--bf-paper-soft)] text-[var(--bf-muted)]">
                  <Search aria-hidden="true" className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-[var(--bf-ink)]">لا توجد نتائج مطابقة</p>
                <p className="mt-1 text-xs text-[var(--bf-muted)]">جرّب اسمًا أو نوع متابعة آخر.</p>
              </div>
            ) : null}
            <div className="border-t border-[var(--bf-line)] px-4 py-3 sm:px-5">
              <p className="text-xs text-[var(--bf-muted)]">
                {filteredItems.length} من {operationalItems.length} مهام ظاهرة · بيانات تجريبية للمعاينة
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--bf-ink)]">اختصارات الإدارة</h2>
                  <p className="mt-1 text-xs text-[var(--bf-muted)]">وصول سريع إلى مسارات العمل.</p>
                </div>
                <ArrowUpLeft aria-hidden="true" className="h-4 w-4 text-[var(--bf-muted)]" />
              </div>
              <div className="mt-4 space-y-2">
                {([
                  ["people", "الأشخاص", "طلاب ومدرسون"],
                  ["levels", "المستويات والمحتوى", "CEFR وموارد التعلّم"],
                  ["classes", "الحصص", `${counts.classesToday} حصة اليوم`],
                ] as const).map(([action, title, detail]) => {
                  const Icon = quickActionDetails[action].icon;
                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => openQuickAction(action)}
                      className="flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-[var(--bf-line)] px-3 text-right transition-colors hover:bg-[var(--bf-paper-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bf-paper-soft)] text-[var(--bf-purple)]">
                        <Icon aria-hidden="true" className="h-[17px] w-[17px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--bf-ink)]">{title}</span>
                        <span className="mt-0.5 block text-xs text-[var(--bf-muted)]">{detail}</span>
                      </span>
                      <ChevronLeft aria-hidden="true" className="h-4 w-4 text-[var(--bf-muted)]" />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server aria-hidden="true" className="h-4 w-4 text-[var(--bf-muted)]" />
                  <h2 className="text-sm font-semibold text-[var(--bf-ink)]">حالة الخدمات</h2>
                </div>
                <span className="rounded-full bg-[var(--bf-green-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--bf-green)]">
                  طبيعي
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-[var(--bf-muted)]">
                    <Activity aria-hidden="true" className="h-4 w-4" />
                    المنصة
                  </span>
                  <span className="text-xs font-medium text-[var(--bf-ink)]">تعمل</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-[var(--bf-muted)]">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    الإشعارات
                  </span>
                  <span className="text-xs font-medium text-[var(--bf-ink)]">نشطة</span>
                </div>
              </div>
              <p className="mt-4 border-t border-[var(--bf-line)] pt-3 text-[11px] leading-5 text-[var(--bf-muted)]">
                حالة توضيحية · لا ترتبط بفحص خدمة مباشر
              </p>
            </section>

            <div className="flex items-start gap-2 rounded-lg px-1 py-1 text-xs leading-5 text-[var(--bf-muted)]">
              <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>اليوم · متابعة سير التعلّم من الحصة إلى Feedback والواجب.</p>
            </div>
          </aside>
        </div>
      </div>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-[#202d28]/25 p-0 sm:place-items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="operation-dialog-title"
            className="w-full rounded-t-2xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-5 sm:max-w-md sm:rounded-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-medium ${itemMeta[selectedItem.type].color}`}>
                  {itemMeta[selectedItem.type].label}
                </p>
                <h2 id="operation-dialog-title" className="mt-1 text-lg font-semibold text-[var(--bf-ink)]">
                  {selectedItem.actionLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="إغلاق التفاصيل"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 space-y-3 rounded-lg bg-[var(--bf-paper-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--bf-ink)]">{selectedItem.studentOrClass}</p>
              <p className="text-sm text-[var(--bf-muted)]">{selectedItem.owner}</p>
              <p className="text-sm text-[var(--bf-muted)]">{selectedItem.dueLabel}</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--bf-muted)]">
              معاينة محلية فقط. لم يتم تنفيذ أي تغيير أو حفظ بيانات.
            </p>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="mt-5 min-h-11 w-full rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0f6748]"
            >
              إغلاق المعاينة
            </button>
          </section>
        </div>
      ) : null}

      {quickAction && activeAction ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-[#202d28]/25 p-0 sm:place-items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQuickAction(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-action-title"
            className="w-full rounded-t-2xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-5 sm:max-w-md sm:rounded-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--bf-purple-soft)] text-[var(--bf-purple)]">
                  {QuickIcon ? <QuickIcon aria-hidden="true" className="h-5 w-5" /> : null}
                </span>
                <div>
                  <h2 id="quick-action-title" className="text-lg font-semibold text-[var(--bf-ink)]">
                    {activeAction.title}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--bf-muted)]">اختصار محلي للمعاينة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAction(null)}
                aria-label="إغلاق الاختصار"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--bf-muted)]">{activeAction.description}</p>
            <form onSubmit={handleQuickSubmit} className="mt-5">
              <label htmlFor="quick-action-search" className="mb-2 block text-xs font-medium text-[var(--bf-ink)]">
                بحث محلي
              </label>
              <input
                id="quick-action-search"
                value={quickQuery}
                onChange={(event) => {
                  setQuickQuery(event.target.value);
                  setQuickNotice("");
                }}
                placeholder={activeAction.prompt}
                className="min-h-11 w-full rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] px-3 text-sm text-[var(--bf-ink)] outline-none placeholder:text-[#89958e] focus:border-[var(--bf-green)] focus:ring-2 focus:ring-[var(--bf-green-soft)]"
              />
              {quickNotice ? (
                <p role="status" className="mt-2 text-xs leading-5 text-[var(--bf-green)]">{quickNotice}</p>
              ) : null}
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white hover:bg-[#0f6748]"
                >
                  بحث
                  <Search aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAction(null)}
                  className="min-h-11 rounded-lg border border-[var(--bf-line)] px-4 text-sm font-medium text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)]"
                >
                  إلغاء
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[var(--bf-muted)]">
                لا تُحفظ أي تغييرات في هذه المعاينة.
              </p>
            </form>
          </section>
        </div>
      ) : null}
    </AppLayout>
  );
}