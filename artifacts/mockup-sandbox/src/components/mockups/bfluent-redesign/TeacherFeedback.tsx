import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { AppLayout } from "./_shared/AppLayout";

type Session = {
  student: string;
  level: string;
  stage: string;
  date: string;
  topic: string;
  status: string;
};

type SkillName =
  | "Speaking"
  | "Listening"
  | "Grammar"
  | "Vocabulary"
  | "Pronunciation";
type SkillScores = Record<SkillName, number | null>;
type EbiItem = { id: number; text: string };
type Expression = {
  id: number;
  phrase: string;
  meaning: string;
  example: string;
  reusable: boolean;
};
type Idiom = { id: number; phrase: string; meaning: string };
type Mistake = {
  id: number;
  incorrect: string;
  correct: string;
  explanation: string;
};
type PronunciationNote = {
  id: number;
  word: string;
  heard: string;
  target: string;
  note: string;
};
type FeedbackDraft = {
  scores: SkillScores;
  wentWell: string;
  ebi: EbiItem[];
  expressions: Expression[];
  idioms: Idiom[];
  mistakes: Mistake[];
  pronunciation: PronunciationNote[];
  teacherNotes: string;
};

const session: Session = {
  student: "ليان محمود",
  level: "B1",
  stage: "B1.2",
  date: "الخميس، ١ أكتوبر ٢٠٢٦",
  topic: "ترتيب رحلة قصيرة",
  status: "انتهت",
};

const skillNames: SkillName[] = [
  "Speaking",
  "Listening",
  "Grammar",
  "Vocabulary",
  "Pronunciation",
];

const initialDraft: FeedbackDraft = {
  scores: {
    Speaking: 4,
    Listening: 4,
    Grammar: 3,
    Vocabulary: 4,
    Pronunciation: 3,
  },
  wentWell:
    "عبّرت ليان عن تفضيلاتها بوضوح، ووسّعت إجاباتها بتفاصيل مناسبة من دون تردد طويل.",
  ebi: [
    {
      id: 1,
      text: "استخدمي going to عند الحديث عن خطط حُسمت مسبقاً، وwill للقرارات اللحظية.",
    },
  ],
  expressions: [
    {
      id: 2,
      phrase: "I’m leaning towards…",
      meaning: "أميل إلى اختيار…",
      example: "I’m leaning towards the train because it’s more convenient.",
      reusable: true,
    },
  ],
  idioms: [
    {
      id: 3,
      phrase: "off the beaten path",
      meaning: "مكان بعيد عن المسارات السياحية المعتادة",
    },
  ],
  mistakes: [
    {
      id: 4,
      incorrect: "We will visit the museum tomorrow (خطة مقررة)",
      correct: "We’re going to visit the museum tomorrow.",
      explanation: "لخطة اتُّخذ قرارها مسبقاً، نستخدم going to.",
    },
  ],
  pronunciation: [
    {
      id: 5,
      word: "comfortable",
      heard: "com-for-ta-ble",
      target: "/ˈkʌmf.tə.bəl/",
      note: "تدرّبي على دمج المقطع الأوسط ليصبح النطق أقرب إلى ثلاثة مقاطع.",
    },
  ],
  teacherNotes:
    "كانت أكثر ارتياحاً في النصف الثاني من الحصة. ابدئي الحصة القادمة بسؤال مفتوح لتشجيعها على التوسّع.",
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper)] px-3 py-2 text-sm leading-6 text-[var(--bf-ink)] outline-none transition-colors placeholder:text-[var(--bf-muted)]/70 focus:border-[var(--bf-green)] focus:ring-2 focus:ring-[var(--bf-green)]/10";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--bf-muted)]";
const sectionClass =
  "rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-4 md:p-5";
const addButtonClass =
  "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--bf-green)] transition-colors hover:bg-[var(--bf-green-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]";

function SectionHeading({
  title,
  description,
  count,
}: {
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold leading-6 text-[var(--bf-ink)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-[var(--bf-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {count !== undefined ? (
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[var(--bf-paper-soft)] px-2 text-xs text-[var(--bf-muted)]">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function RowRemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--bf-muted)] transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
    >
      <Trash2 aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  dir = "auto",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "auto" | "ltr" | "rtl";
  multiline?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea
          dir={dir}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} min-h-[76px] resize-y`}
        />
      ) : (
        <input
          dir={dir}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  );
}

export function TeacherFeedback() {
  const [draft, setDraft] = useState<FeedbackDraft>(initialDraft);
  const [workflowStatus, setWorkflowStatus] = useState<
    "DRAFT" | "READY_TO_PUBLISH"
  >("DRAFT");
  const [nextId, setNextId] = useState(10);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [previewPublished, setPreviewPublished] = useState(false);
  const [notice, setNotice] = useState("");

  const resetWorkflow = () => {
    setWorkflowStatus("DRAFT");
    setPreviewPublished(false);
    setNotice("");
  };

  const updateDraft = <K extends keyof FeedbackDraft>(
    key: K,
    value: FeedbackDraft[K],
  ) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    resetWorkflow();
  };

  const updateScores = (skill: SkillName, score: number | null) => {
    setDraft((previous) => ({
      ...previous,
      scores: { ...previous.scores, [skill]: score },
    }));
    resetWorkflow();
  };

  const updateEbi = (id: number, text: string) => {
    updateDraft(
      "ebi",
      draft.ebi.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const updateExpression = (
    id: number,
    key: keyof Omit<Expression, "id">,
    value: string | boolean,
  ) => {
    updateDraft(
      "expressions",
      draft.expressions.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateIdiom = (
    id: number,
    key: keyof Omit<Idiom, "id">,
    value: string,
  ) => {
    updateDraft(
      "idioms",
      draft.idioms.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateMistake = (
    id: number,
    key: keyof Omit<Mistake, "id">,
    value: string,
  ) => {
    updateDraft(
      "mistakes",
      draft.mistakes.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updatePronunciation = (
    id: number,
    key: keyof Omit<PronunciationNote, "id">,
    value: string,
  ) => {
    updateDraft(
      "pronunciation",
      draft.pronunciation.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  const educationalContentAvailable =
    Boolean(draft.wentWell.trim()) ||
    draft.ebi.some((item) => item.text.trim().length > 0);

  const addEbi = () => {
    updateDraft("ebi", [...draft.ebi, { id: nextId, text: "" }]);
    setNextId((id) => id + 1);
  };
  const addExpression = () => {
    updateDraft("expressions", [
      ...draft.expressions,
      { id: nextId, phrase: "", meaning: "", example: "", reusable: false },
    ]);
    setNextId((id) => id + 1);
  };
  const addIdiom = () => {
    updateDraft("idioms", [
      ...draft.idioms,
      { id: nextId, phrase: "", meaning: "" },
    ]);
    setNextId((id) => id + 1);
  };
  const addMistake = () => {
    updateDraft("mistakes", [
      ...draft.mistakes,
      { id: nextId, incorrect: "", correct: "", explanation: "" },
    ]);
    setNextId((id) => id + 1);
  };
  const addPronunciation = () => {
    updateDraft("pronunciation", [
      ...draft.pronunciation,
      { id: nextId, word: "", heard: "", target: "", note: "" },
    ]);
    setNextId((id) => id + 1);
  };

  const prepareToPublish = () => {
    if (!educationalContentAvailable) {
      setNotice("أضيفي ما أتقنه الطالب أو هدف تحسين واحداً على الأقل.");
      return;
    }
    setWorkflowStatus("READY_TO_PUBLISH");
    setNotice("المحتوى التعليمي مكتمل للمراجعة. لن يُنشر تلقائياً.");
  };

  const confirmPreviewPublish = () => {
    setPreviewPublished(true);
    setPublishDialogOpen(false);
    setNotice("تمت محاكاة النشر محلياً؛ لم يُرسل Feedback إلى الطالب.");
  };

  const statusLabel =
    previewPublished
      ? "معاينة النشر"
      : workflowStatus === "READY_TO_PUBLISH"
        ? "جاهز للنشر"
        : "مسودة";
  const statusClass =
    workflowStatus === "READY_TO_PUBLISH" || previewPublished
      ? "bg-[var(--bf-green-soft)] text-[var(--bf-green)]"
      : "bg-[var(--bf-purple-soft)] text-[var(--bf-purple)]";

  return (
    <AppLayout
      role="teacher"
      active="feedback"
      title="Feedback"
      subtitle="اكتبي ملاحظات واضحة تساعد الطالب على مواصلة التعلّم بعد الحصة."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_292px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <section className={sectionClass} aria-labelledby="session-heading">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-[11px] font-medium text-[var(--bf-green)]">
                  Feedback بعد الحصة
                </p>
                <h2
                  id="session-heading"
                  className="text-base font-semibold text-[var(--bf-ink)]"
                >
                  {session.topic}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bf-green-soft)] px-2.5 py-1 text-xs font-medium text-[var(--bf-green)]">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                {session.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--bf-line)] pt-3 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-[var(--bf-muted)]">الطالب</p>
                <p className="mt-1 text-sm font-medium">{session.student}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--bf-muted)]">المستوى</p>
                <p className="mt-1 text-sm font-medium" dir="ltr">
                  {session.level} <span className="text-[var(--bf-muted)]">·</span>{" "}
                  {session.stage}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--bf-muted)]">التاريخ</p>
                <p className="mt-1 text-sm font-medium">{session.date}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--bf-muted)]">الحالة</p>
                <p className="mt-1 text-sm font-medium">{session.status}</p>
              </div>
            </div>
          </section>

          <section className={sectionClass} aria-label="تقييم المهارات">
            <SectionHeading
              title="المهارات"
              description="تقييم اختياري من ١ إلى ٥"
            />
            <div
              className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {skillNames.map((skill) => (
                <fieldset key={skill} className="min-w-0">
                  <legend
                    className="mb-2 text-xs font-medium text-[var(--bf-ink)]"
                    dir="ltr"
                  >
                    {skill}
                  </legend>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        aria-label={`${skill}: ${score} من ٥`}
                        aria-pressed={draft.scores[skill] === score}
                        onClick={() => updateScores(skill, score)}
                        className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)] ${
                          draft.scores[skill] === score
                            ? "border-[var(--bf-green)] bg-[var(--bf-green)] text-white"
                            : "border-[var(--bf-line)] bg-[var(--bf-paper)] text-[var(--bf-muted)] hover:border-[var(--bf-green)] hover:text-[var(--bf-green)]"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label={`مسح تقييم ${skill}`}
                      onClick={() => updateScores(skill, null)}
                      className="mr-1 rounded px-1.5 py-2 text-[11px] text-[var(--bf-muted)] hover:text-[var(--bf-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
                    >
                      مسح
                    </button>
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="ما أتقنه الطالب"
              description="ملاحظة محددة تساعده على معرفة ما نجح فيه."
            />
            <Field
              label="What went well"
              value={draft.wentWell}
              onChange={(value) => updateDraft("wentWell", value)}
              placeholder="ما الذي فعله الطالب جيداً؟"
              multiline
            />
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="هدف التحسين"
              description="EBI · خطوة واحدة واضحة قابلة للتطبيق"
              count={draft.ebi.length}
            />
            <div className="space-y-3">
              {draft.ebi.length === 0 ? (
                <p className="rounded-lg bg-[var(--bf-paper-soft)] px-3 py-3 text-sm text-[var(--bf-muted)]">
                  لا توجد أهداف بعد. أضيفي خطوة صغيرة للحصة القادمة.
                </p>
              ) : null}
              {draft.ebi.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="mt-3.5 text-xs text-[var(--bf-muted)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Field
                      label={`هدف التحسين ${index + 1}`}
                      value={item.text}
                      onChange={(value) => updateEbi(item.id, value)}
                      placeholder="مثال: تدرّبي على..."
                      multiline
                    />
                  </div>
                  <div className="pt-5">
                    <RowRemoveButton
                      label="حذف هدف التحسين"
                      onClick={() =>
                        updateDraft(
                          "ebi",
                          draft.ebi.filter((row) => row.id !== item.id),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button type="button" className={addButtonClass} onClick={addEbi}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                إضافة هدف
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="تعبير أو مفردة"
              description="عبارة، معناها، ومثال من سياق الطالب."
              count={draft.expressions.length}
            />
            <div className="space-y-4">
              {draft.expressions.length === 0 ? (
                <p className="rounded-lg bg-[var(--bf-paper-soft)] px-3 py-3 text-sm text-[var(--bf-muted)]">
                  لم تُضف مفردات بعد.
                </p>
              ) : null}
              {draft.expressions.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--bf-muted)]">
                      تعبير {index + 1}
                    </span>
                    <RowRemoveButton
                      label="حذف التعبير"
                      onClick={() =>
                        updateDraft(
                          "expressions",
                          draft.expressions.filter((row) => row.id !== item.id),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Expression / Vocabulary"
                      value={item.phrase}
                      onChange={(value) =>
                        updateExpression(item.id, "phrase", value)
                      }
                      placeholder="مثال: I’m leaning towards…"
                      dir="ltr"
                    />
                    <Field
                      label="المعنى"
                      value={item.meaning}
                      onChange={(value) =>
                        updateExpression(item.id, "meaning", value)
                      }
                      placeholder="المعنى بالعربية"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="مثال"
                        value={item.example}
                        onChange={(value) =>
                          updateExpression(item.id, "example", value)
                        }
                        placeholder="جملة قصيرة توضّح الاستخدام"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <label className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-2 text-xs text-[var(--bf-muted)]">
                    <input
                      type="checkbox"
                      checked={item.reusable}
                      onChange={(event) =>
                        updateExpression(
                          item.id,
                          "reusable",
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4 rounded border-[var(--bf-line)] accent-[var(--bf-green)]"
                    />
                    يمكن إعادة استخدامه في مصادر التعلّم
                  </label>
                </div>
              ))}
              <button
                type="button"
                className={addButtonClass}
                onClick={addExpression}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                إضافة تعبير
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="Idioms / Slang / Chunks"
              description="عبارات جديدة ظهرت في الحصة."
              count={draft.idioms.length}
            />
            <div className="space-y-3">
              {draft.idioms.length === 0 ? (
                <p className="rounded-lg bg-[var(--bf-paper-soft)] px-3 py-3 text-sm text-[var(--bf-muted)]">
                  لا توجد عبارات مضافة.
                </p>
              ) : null}
              {draft.idioms.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="العبارة"
                      value={item.phrase}
                      onChange={(value) =>
                        updateIdiom(item.id, "phrase", value)
                      }
                      placeholder="اكتبي العبارة"
                      dir="ltr"
                    />
                    <Field
                      label="المعنى"
                      value={item.meaning}
                      onChange={(value) =>
                        updateIdiom(item.id, "meaning", value)
                      }
                      placeholder="المعنى أو الاستخدام"
                    />
                  </div>
                  <div className="pt-5">
                    <RowRemoveButton
                      label="حذف العبارة"
                      onClick={() =>
                        updateDraft(
                          "idioms",
                          draft.idioms.filter((row) => row.id !== item.id),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button type="button" className={addButtonClass} onClick={addIdiom}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                إضافة عبارة
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="Common Mistakes"
              description="من الصيغة التي قيلت إلى الصيغة المستهدفة."
              count={draft.mistakes.length}
            />
            <div className="space-y-4">
              {draft.mistakes.length === 0 ? (
                <p className="rounded-lg bg-[var(--bf-paper-soft)] px-3 py-3 text-sm text-[var(--bf-muted)]">
                  لا توجد أخطاء شائعة مضافة.
                </p>
              ) : null}
              {draft.mistakes.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--bf-line)] p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--bf-muted)]">
                      تصحيح {index + 1}
                    </span>
                    <RowRemoveButton
                      label="حذف التصحيح"
                      onClick={() =>
                        updateDraft(
                          "mistakes",
                          draft.mistakes.filter((row) => row.id !== item.id),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="الصيغة التي قيلت"
                      value={item.incorrect}
                      onChange={(value) =>
                        updateMistake(item.id, "incorrect", value)
                      }
                      placeholder="الصيغة غير الدقيقة"
                      dir="auto"
                    />
                    <Field
                      label="الصيغة الصحيحة"
                      value={item.correct}
                      onChange={(value) =>
                        updateMistake(item.id, "correct", value)
                      }
                      placeholder="الصيغة المستهدفة"
                      dir="auto"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="الشرح أو المثال"
                        value={item.explanation}
                        onChange={(value) =>
                          updateMistake(item.id, "explanation", value)
                        }
                        placeholder="توضيح مختصر عند الحاجة"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={addButtonClass}
                onClick={addMistake}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                إضافة تصحيح
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              title="Pronunciation Mistakes"
              description="الكلمة، النطق الذي سُمِع، ثم النطق المستهدف."
              count={draft.pronunciation.length}
            />
            <div className="space-y-4">
              {draft.pronunciation.length === 0 ? (
                <p className="rounded-lg bg-[var(--bf-paper-soft)] px-3 py-3 text-sm text-[var(--bf-muted)]">
                  لا توجد ملاحظات نطق مضافة.
                </p>
              ) : null}
              {draft.pronunciation.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--bf-line)] p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--bf-muted)]">
                      ملاحظة نطق {index + 1}
                    </span>
                    <RowRemoveButton
                      label="حذف ملاحظة النطق"
                      onClick={() =>
                        updateDraft(
                          "pronunciation",
                          draft.pronunciation.filter(
                            (row) => row.id !== item.id,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="الكلمة"
                      value={item.word}
                      onChange={(value) =>
                        updatePronunciation(item.id, "word", value)
                      }
                      placeholder="الكلمة المستهدفة"
                      dir="ltr"
                    />
                    <Field
                      label="ما سُمِع"
                      value={item.heard}
                      onChange={(value) =>
                        updatePronunciation(item.id, "heard", value)
                      }
                      placeholder="نطق الطالب"
                      dir="ltr"
                    />
                    <Field
                      label="النطق المستهدف"
                      value={item.target}
                      onChange={(value) =>
                        updatePronunciation(item.id, "target", value)
                      }
                      placeholder="مثال: /ˈwɜːd/"
                      dir="ltr"
                    />
                    <Field
                      label="ملاحظة المدرس"
                      value={item.note}
                      onChange={(value) =>
                        updatePronunciation(item.id, "note", value)
                      }
                      placeholder="توجيه قصير للتدريب"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={addButtonClass}
                onClick={addPronunciation}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                إضافة ملاحظة نطق
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--bf-purple)]/15 bg-[var(--bf-purple-soft)]/55 p-4 md:p-5">
            <div className="mb-3 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bf-paper)] text-[var(--bf-purple)]">
                <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--bf-purple)]">
                  ملاحظة خاصة للمدرس
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--bf-muted)]">
                  خاصة — لا تظهر للطالب عند نشر Feedback.
                </p>
              </div>
            </div>
            <Field
              label="Teacher note"
              value={draft.teacherNotes}
              onChange={(value) => updateDraft("teacherNotes", value)}
              placeholder="ملاحظات للمتابعة في الحصة القادمة"
              multiline
            />
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className={sectionClass} aria-label="حالة Feedback">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">حالة Feedback</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                aria-live="polite"
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--bf-muted)]">
              {previewPublished
                ? "هذه محاكاة محلية فقط؛ لم يتم الإرسال إلى حساب الطالب."
                : workflowStatus === "READY_TO_PUBLISH"
                  ? "راجعي المحتوى ثم ابدئي تأكيد النشر."
                  : "المحتوى يُحرر محلياً في هذه المعاينة، ولا يُحفظ على الخادم."}
            </p>
            <div className="my-4 h-px bg-[var(--bf-line)]" />
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--bf-muted)]">مهارات مُقيّمة</span>
                <span className="font-medium" dir="ltr">
                  {Object.values(draft.scores).filter((score) => score !== null)
                    .length}{" "}
                  / 5
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--bf-muted)]">أهداف التحسين</span>
                <span className="font-medium">{draft.ebi.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--bf-muted)]">مفردات وعبارات</span>
                <span className="font-medium">
                  {draft.expressions.length + draft.idioms.length}
                </span>
              </div>
            </div>
            {notice ? (
              <p
                role="status"
                className="mt-4 rounded-lg bg-[var(--bf-paper-soft)] px-3 py-2.5 text-xs leading-5 text-[var(--bf-ink)]"
              >
                {notice}
              </p>
            ) : null}
            {previewPublished ? (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--bf-green)]/20 bg-[var(--bf-green-soft)] px-3 py-3 text-xs leading-5 text-[var(--bf-green)]">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                تمت معاينة النشر محلياً فقط.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {workflowStatus === "DRAFT" ? (
                  <button
                    type="button"
                    onClick={prepareToPublish}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--bf-green)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)] focus-visible:ring-offset-2"
                  >
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    مراجعة جاهزية النشر
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPublishDialogOpen(true)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--bf-green)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)] focus-visible:ring-offset-2"
                  >
                    <Check aria-hidden="true" className="h-4 w-4" />
                    مراجعة وتأكيد النشر
                  </button>
                )}
                {workflowStatus === "READY_TO_PUBLISH" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflowStatus("DRAFT");
                      setNotice("عادت الحالة إلى مسودة محلية.");
                    }}
                    className="min-h-10 w-full rounded-lg px-3 text-sm text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
                  >
                    إعادة إلى المسودة
                  </button>
                ) : null}
              </div>
            )}
            <p className="mt-3 text-[11px] leading-5 text-[var(--bf-muted)]">
              لا يُنشر أي محتوى تلقائياً. الملاحظة الخاصة مستثناة من معاينة الطالب.
            </p>
          </section>

          <section className="rounded-xl border border-[var(--bf-line)] bg-[var(--bf-paper-soft)] p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bf-green)]"
              />
              <p className="text-xs leading-5 text-[var(--bf-muted)]">
                اكتفي بهدف تحسين واحد واضح. التقييمات اختيارية، ويمكن تركها بلا
                إجابة.
              </p>
            </div>
          </section>
        </aside>
      </div>

      {publishDialogOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--bf-ink)]/35 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPublishDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-title"
            className="w-full max-w-md rounded-2xl border border-[var(--bf-line)] bg-[var(--bf-paper)] p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-medium text-[var(--bf-green)]">
                  مراجعة أخيرة
                </span>
                <h2
                  id="publish-title"
                  className="mt-1 text-lg font-semibold text-[var(--bf-ink)]"
                >
                  تأكيد معاينة النشر؟
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPublishDialogOpen(false)}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-lg text-[var(--bf-muted)] hover:bg-[var(--bf-paper-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--bf-muted)]">
              سيظهر للطالب ملخص الحصة وملاحظات التعلّم فقط. هذه خطوة توضيحية
              داخل المعاينة ولا ترسل شيئاً فعلياً.
            </p>
            <div className="mt-4 rounded-lg border border-[var(--bf-purple)]/15 bg-[var(--bf-purple-soft)]/55 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--bf-purple)]">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                ملاحظة المدرس مستثناة
              </div>
              <p className="mt-1.5 text-xs leading-5 text-[var(--bf-muted)]">
                “{draft.teacherNotes || "لا توجد ملاحظة خاصة"}” لن تظهر للطالب.
              </p>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setPublishDialogOpen(false)}
                className="min-h-11 flex-1 rounded-lg border border-[var(--bf-line)] px-4 text-sm font-medium text-[var(--bf-ink)] hover:bg-[var(--bf-paper-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)]"
              >
                متابعة التحرير
              </button>
              <button
                type="button"
                onClick={confirmPreviewPublish}
                className="min-h-11 flex-1 rounded-lg bg-[var(--bf-green)] px-4 text-sm font-semibold text-white hover:bg-[var(--bf-green)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bf-green)] focus-visible:ring-offset-2"
              >
                تأكيد المعاينة
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AppLayout>
  );
}