import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Check,
  Clock3,
  FileText,
  MessageSquareText,
  Target,
} from "lucide-react";
import { AppLayout } from "./_shared/AppLayout";

type Student = {
  firstName: string;
  level: string;
  stage: string;
  goal: string;
  progressPercent: number;
};

type Activity = {
  title: string;
  skill: string;
  minutes: number;
  reason: string;
};

type Session = {
  startsAt: string;
  teacher: string;
  topic: string;
  joinAvailable: boolean;
};

type Homework = {
  title: string;
  dueLabel: string;
  status: "OPEN" | "SUBMITTED";
};

type FeedbackHighlight = {
  skill: string;
  note: string;
  publishedAt: string;
};

function tomorrowAtSixThirty() {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1);
  startsAt.setHours(18, 30, 0, 0);
  return startsAt.toISOString();
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const student: Student = {
  firstName: "ليان",
  level: "B1",
  stage: "B1.2 · المرحلة الثانية",
  goal: "أتحدث بثقة عن مواقف العمل والحياة اليومية.",
  progressPercent: 63,
};

const activity: Activity = {
  title: "احكي عن موقف حللتِ فيه مشكلة",
  skill: "Speaking",
  minutes: 12,
  reason: "خطوتك التالية: أضيفي سببًا أو مثالًا إلى إجاباتك الواضحة.",
};

const session: Session = {
  startsAt: tomorrowAtSixThirty(),
  teacher: "نورا العتيبي",
  topic: "محادثة عملية: مواقف في العمل",
  joinAvailable: false,
};

const homework: Homework = {
  title: "اكتبي عن تحدٍّ واجهتِه في العمل",
  dueLabel: "غدًا",
  status: "OPEN",
};

const feedback: FeedbackHighlight = {
  skill: "Speaking",
  note: "تحدثتِ بجمل واضحة ومترابطة. في المرة القادمة، أضيفي مثالًا يوضح فكرتك.",
  publishedAt: daysAgo(2),
};

function formatSessionDate(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}، ${date.toLocaleTimeString("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
  });
}

export function StudentHome() {
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [classDetailsOpen, setClassDetailsOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [homeworkAnswer, setHomeworkAnswer] = useState("");
  const [homeworkSubmittedLocally, setHomeworkSubmittedLocally] = useState(false);
  const [feedbackDetailsOpen, setFeedbackDetailsOpen] = useState(false);

  function handleHomeworkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHomeworkSubmittedLocally(true);
  }

  return (
    <AppLayout
      role="student"
      active="home"
      title="الرئيسية"
      subtitle="مساحة هادئة تتابعين منها هدفك وخطوتك التعليمية التالية."
    >
      <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[var(--bf-muted)]">مسارك مستمر</p>
            <h1 className="mt-1 text-[26px] font-semibold leading-tight text-[var(--bf-purple)] sm:text-[30px]">
              أهلًا، {student.firstName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--bf-muted)]">
              حصة، ملاحظة واضحة، وخطوة واحدة مفيدة لليوم.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper)] px-3.5 py-2.5 sm:self-auto">
            <BookOpen aria-hidden="true" className="h-5 w-5 text-[var(--bf-green)]" />
            <div>
              <p className="text-[11px] leading-4 text-[var(--bf-muted)]">مستواك الرسمي · CEFR</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--bf-ink)]">
                {student.level} <span className="font-normal text-[var(--bf-muted)]">· {student.stage}</span>
              </p>
            </div>
          </div>
        </header>

        <section
          aria-label="هدفك الحالي وتقدم المرحلة"
          className="grid gap-5 rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_250px] md:items-center"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bf-purple-soft)] text-[var(--bf-purple)]">
              <Target aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--bf-muted)]">هدفك الحالي</p>
              <p className="mt-1 text-sm font-medium leading-6 text-[var(--bf-ink)]">{student.goal}</p>
            </div>
          </div>
          <div className="border-t border-[var(--bf-line)] pt-4 md:border-r md:border-t-0 md:pr-5 md:pt-0">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-[var(--bf-muted)]">التقدم في {student.stage}</span>
              <span className="font-semibold tabular-nums text-[var(--bf-green)]">{student.progressPercent}٪</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--bf-green-soft)]"
              role="progressbar"
              aria-label="التقدم في المرحلة الحالية"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={student.progressPercent}
            >
              <div
                className="h-full rounded-full bg-[var(--bf-green)]"
                style={{ width: `${student.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[var(--bf-muted)]">
              تقدم مرتبط بأهداف المرحلة، وليس بالنقاط.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="next-activity-title"
          className="overflow-hidden rounded-xl border border-[#d7e7dc] bg-[#eef6f0]"
        >
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--bf-green)]">
                <span className="h-2 w-2 rounded-full bg-[var(--bf-green)]" />
                الخطوة التالية
              </span>
              <span className="h-3.5 w-px bg-[#cbd9cf]" aria-hidden="true" />
              <span className="text-xs text-[var(--bf-muted)]">اقتراح مبني على ملاحظتك الأخيرة</span>
            </div>
            <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <h2 id="next-activity-title" className="text-xl font-semibold leading-8 text-[var(--bf-ink)] sm:text-2xl">
                  {activity.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#53665b]">{activity.reason}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--bf-muted)]">
                  <span className="rounded-md border border-[#d7e5db] bg-[var(--bf-paper)] px-2.5 py-1.5 font-medium text-[var(--bf-green)]">
                    {activity.skill}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e3eee6] px-2.5 py-1.5">
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {activity.minutes} دقيقة
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPracticeOpen((open) => !open);
                  setPracticeCompleted(false);
                }}
                aria-expanded={practiceOpen}
                aria-controls="practice-panel"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--bf-green)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#116449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
              >
                {practiceOpen ? "إغلاق التدريب" : "ابدئي التدريب"}
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
          {practiceOpen ? (
            <div id="practice-panel" className="border-t border-[#d7e7dc] bg-[var(--bf-paper)] px-5 py-5 sm:px-7">
              {practiceCompleted ? (
                <div className="flex items-start gap-3" role="status">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--bf-green-soft)] text-[var(--bf-green)]">
                    <Check aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--bf-ink)]">انتهى التدريب</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--bf-muted)]">
                      اكتمل في هذه المعاينة فقط؛ لم يُرسل أو يُحفظ على الخادم.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--bf-muted)]">تدرّبي على هذه الفكرة بالإنجليزية</span>
                    <p className="mt-1 text-sm font-medium text-[var(--bf-ink)]" lang="en" dir="ltr">
                      Describe one small problem you solved at work.
                    </p>
                    <textarea
                      value={practiceAnswer}
                      onChange={(event) => setPracticeAnswer(event.target.value)}
                      rows={2}
                      placeholder="دوّني فكرة أو مثالًا قبل أن تتحدثي..."
                      className="mt-3 min-h-20 w-full resize-y rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] px-3 py-2.5 text-sm leading-6 text-[var(--bf-ink)] outline-none placeholder:text-[var(--bf-muted)] focus:border-[var(--bf-green)] focus:ring-2 focus:ring-[var(--bf-green-soft)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPracticeCompleted(true)}
                    className="min-h-11 rounded-lg border border-[var(--bf-line)] px-4 text-sm font-semibold text-[var(--bf-green)] hover:bg-[var(--bf-green-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
                  >
                    أنهيت التدريب
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section aria-labelledby="next-class-title" className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--bf-muted)]">موعدك القادم</p>
                <h2 id="next-class-title" className="mt-1 text-base font-semibold text-[var(--bf-ink)]">
                  الحصة القادمة
                </h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--bf-purple-soft)] text-[var(--bf-purple)]">
                <CalendarClock aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--bf-ink)]">{session.topic}</p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--bf-muted)]">{formatSessionDate(session.startsAt)}</p>
            <p className="mt-1 text-sm text-[var(--bf-muted)]">مع {session.teacher}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--bf-line)] pt-4">
              <button
                type="button"
                disabled={!session.joinAvailable}
                title={!session.joinAvailable ? "سيُتاح الانضمام قبل موعد الحصة" : undefined}
                className="min-h-11 rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#e9eee9] disabled:text-[var(--bf-muted)]"
              >
                الانضمام إلى QMeet
              </button>
              <button
                type="button"
                onClick={() => setClassDetailsOpen((open) => !open)}
                aria-expanded={classDetailsOpen}
                className="min-h-11 px-2 text-sm font-semibold text-[var(--bf-green)] underline decoration-[#b5cfc0] underline-offset-4 hover:text-[#116449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
              >
                {classDetailsOpen ? "إخفاء التفاصيل" : "تفاصيل الحصة"}
              </button>
            </div>
            {classDetailsOpen ? (
              <p className="mt-3 rounded-lg bg-[var(--bf-paper-soft)] px-3 py-2.5 text-xs leading-5 text-[var(--bf-muted)]">
                سيظهر رابط الانضمام قبل موعد الحصة. موضوعها مرتبط بهدفك الحالي في مواقف العمل.
              </p>
            ) : null}
          </section>

          <section aria-labelledby="homework-title" className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--bf-muted)]">بانتظارك</p>
                <h2 id="homework-title" className="mt-1 text-base font-semibold text-[var(--bf-ink)]">
                  واجب يحتاج انتباهك
                </h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f5f1e8] text-[#806b38]">
                <FileText aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-6 text-[var(--bf-ink)]">{homework.title}</p>
              <span className="shrink-0 rounded-md bg-[#f5f1e8] px-2 py-1 text-xs font-medium text-[#806b38]">
                {homeworkSubmittedLocally ? "تمت المعاينة" : homework.status === "OPEN" ? "مطلوب" : "تم التسليم"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--bf-muted)]">موعد التسليم: {homework.dueLabel}</p>
            <button
              type="button"
              onClick={() => setHomeworkOpen((open) => !open)}
              aria-expanded={homeworkOpen}
              aria-controls="homework-panel"
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[var(--bf-green)] underline decoration-[#b5cfc0] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
            >
              {homeworkOpen ? "إغلاق الواجب" : homeworkSubmittedLocally ? "عرض الرد المحلي" : "ابدئي الواجب"}
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            {homeworkOpen ? (
              <div id="homework-panel" className="mt-3 border-t border-[var(--bf-line)] pt-4">
                {homeworkSubmittedLocally ? (
                  <p role="status" className="text-xs leading-5 text-[var(--bf-muted)]">
                    سُجّل الرد داخل هذه المعاينة فقط، ولم يُرسل أو يُحفظ على الخادم.
                  </p>
                ) : (
                  <form onSubmit={handleHomeworkSubmit} className="space-y-3">
                    <label className="block">
                      <span className="text-xs font-medium text-[var(--bf-muted)]">مسودة إجابتك</span>
                      <textarea
                        required
                        value={homeworkAnswer}
                        onChange={(event) => setHomeworkAnswer(event.target.value)}
                        rows={3}
                        placeholder="اكتبي بضع جمل عن موقف واجهتِه..."
                        className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] px-3 py-2.5 text-sm leading-6 text-[var(--bf-ink)] outline-none placeholder:text-[var(--bf-muted)] focus:border-[var(--bf-green)] focus:ring-2 focus:ring-[var(--bf-green-soft)]"
                      />
                    </label>
                    <button
                      type="submit"
                      className="min-h-10 rounded-lg border border-[var(--bf-line)] px-3.5 text-xs font-semibold text-[var(--bf-green)] hover:bg-[var(--bf-green-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
                    >
                      معاينة التسليم
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </section>
        </div>

        <section aria-labelledby="feedback-title" className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bf-purple-soft)] text-[var(--bf-purple)]">
              <MessageSquareText aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 id="feedback-title" className="text-sm font-semibold text-[var(--bf-ink)]">ملاحظة منشورة لك</h2>
                <span className="text-xs text-[var(--bf-muted)]">· {feedback.skill}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[var(--bf-muted)]">{feedback.note}</p>
              {feedbackDetailsOpen ? (
                <p className="mt-2 text-xs text-[var(--bf-muted)]">
                  نُشرت في {formatPublishedDate(feedback.publishedAt)} · مرتبطة بهدف التحدث بثقة.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setFeedbackDetailsOpen((open) => !open)}
                aria-expanded={feedbackDetailsOpen}
                className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-[var(--bf-green)] underline decoration-[#b5cfc0] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bf-green)]"
              >
                {feedbackDetailsOpen ? "إخفاء التفاصيل" : "تفاصيل الملاحظة"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}