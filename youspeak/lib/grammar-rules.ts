export interface GrammarRule {
  id: string
  category: string
  categoryAr: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  examples: {
    en: string
    ar: string
  }[]
  notes?: string
  notesAr?: string
}

export const grammarRules: GrammarRule[] = [
  {
    id: '1',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Present Simple',
    titleAr: 'المضارع البسيط',
    description: 'Used for habits, facts, and general truths. Form: Subject + base verb (+ s/es for he/she/it)',
    descriptionAr: 'يستخدم للعادات والحقائق والحقائق العامة. التركيب: الفاعل + الفعل الأساسي (+ s/es مع he/she/it)',
    examples: [
      { en: 'I study English every day.', ar: 'أنا أدرس الإنجليزية كل يوم.' },
      { en: 'She works in a hospital.', ar: 'هي تعمل في مستشفى.' },
      { en: 'Water boils at 100°C.', ar: 'الماء يغلي عند 100 درجة مئوية.' }
    ],
    notes: 'Add -s or -es for third person singular (he, she, it)',
    notesAr: 'أضف -s أو -es مع ضمائر الغائب المفرد (he, she, it)'
  },
  {
    id: '2',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Present Continuous',
    titleAr: 'المضارع المستمر',
    description: 'Used for actions happening now or temporary situations. Form: Subject + am/is/are + verb-ing',
    descriptionAr: 'يستخدم للأفعال التي تحدث الآن أو المواقف المؤقتة. التركيب: الفاعل + am/is/are + الفعل+ing',
    examples: [
      { en: 'I am studying right now.', ar: 'أنا أدرس الآن.' },
      { en: 'They are playing football.', ar: 'هم يلعبون كرة القدم.' },
      { en: 'She is living in Cairo temporarily.', ar: 'هي تعيش في القاهرة مؤقتاً.' }
    ],
    notes: 'Time markers: now, at the moment, currently, today',
    notesAr: 'كلمات دالة: now, at the moment, currently, today'
  },
  {
    id: '3',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Past Simple',
    titleAr: 'الماضي البسيط',
    description: 'Used for completed actions in the past. Form: Subject + verb-ed (regular) or irregular past form',
    descriptionAr: 'يستخدم للأفعال المنتهية في الماضي. التركيب: الفاعل + الفعل+ed (منتظم) أو الصيغة الماضية الشاذة',
    examples: [
      { en: 'I visited London last year.', ar: 'زرت لندن العام الماضي.' },
      { en: 'She finished her homework yesterday.', ar: 'أنهت واجبها المنزلي أمس.' },
      { en: 'They went to the cinema.', ar: 'ذهبوا إلى السينما.' }
    ],
    notes: 'Time markers: yesterday, last week, ago, in 2020',
    notesAr: 'كلمات دالة: yesterday, last week, ago, in 2020'
  },
  {
    id: '4',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Past Continuous',
    titleAr: 'الماضي المستمر',
    description: 'Used for actions in progress at a specific time in the past. Form: Subject + was/were + verb-ing',
    descriptionAr: 'يستخدم للأفعال المستمرة في وقت محدد في الماضي. التركيب: الفاعل + was/were + الفعل+ing',
    examples: [
      { en: 'I was studying when you called.', ar: 'كنت أدرس عندما اتصلت.' },
      { en: 'They were watching TV at 8 PM.', ar: 'كانوا يشاهدون التلفاز في الساعة 8 مساءً.' },
      { en: 'She was cooking dinner.', ar: 'كانت تطبخ العشاء.' }
    ],
    notes: 'Often used with "while" and "when"',
    notesAr: 'غالباً يستخدم مع "while" و "when"'
  },
  {
    id: '5',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Present Perfect',
    titleAr: 'المضارع التام',
    description: 'Used for actions that started in the past and continue to the present, or past actions with present results. Form: Subject + have/has + past participle',
    descriptionAr: 'يستخدم للأفعال التي بدأت في الماضي وتستمر حتى الحاضر، أو أفعال ماضية لها نتائج حاضرة. التركيب: الفاعل + have/has + التصريف الثالث',
    examples: [
      { en: 'I have lived here for 5 years.', ar: 'عشت هنا لمدة 5 سنوات.' },
      { en: 'She has finished her work.', ar: 'أنهت عملها.' },
      { en: 'We have seen this movie before.', ar: 'شاهدنا هذا الفيلم من قبل.' }
    ],
    notes: 'Time markers: already, yet, just, ever, never, for, since',
    notesAr: 'كلمات دالة: already, yet, just, ever, never, for, since'
  },
  {
    id: '6',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Present Perfect Continuous',
    titleAr: 'المضارع التام المستمر',
    description: 'Used for actions that started in the past and are still continuing. Form: Subject + have/has + been + verb-ing',
    descriptionAr: 'يستخدم للأفعال التي بدأت في الماضي ولا تزال مستمرة. التركيب: الفاعل + have/has + been + الفعل+ing',
    examples: [
      { en: 'I have been studying for 3 hours.', ar: 'أدرس منذ 3 ساعات.' },
      { en: 'She has been working here since 2020.', ar: 'تعمل هنا منذ 2020.' },
      { en: 'They have been waiting for you.', ar: 'ينتظرونك.' }
    ],
    notes: 'Emphasizes duration and continuity',
    notesAr: 'يؤكد على المدة والاستمرارية'
  },
  {
    id: '7',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Past Perfect',
    titleAr: 'الماضي التام',
    description: 'Used for actions completed before another past action. Form: Subject + had + past participle',
    descriptionAr: 'يستخدم للأفعال المنتهية قبل فعل ماضي آخر. التركيب: الفاعل + had + التصريف الثالث',
    examples: [
      { en: 'I had finished my work before he arrived.', ar: 'أنهيت عملي قبل أن يصل.' },
      { en: 'She had already left when I called.', ar: 'كانت قد غادرت بالفعل عندما اتصلت.' },
      { en: 'They had never seen snow before.', ar: 'لم يروا الثلج من قبل.' }
    ],
    notes: 'Shows which action happened first in the past',
    notesAr: 'يوضح أي فعل حدث أولاً في الماضي'
  },
  {
    id: '8',
    category: 'Tenses',
    categoryAr: 'الأزمنة',
    title: 'Future Simple',
    titleAr: 'المستقبل البسيط',
    description: 'Used for future predictions and spontaneous decisions. Form: Subject + will + base verb',
    descriptionAr: 'يستخدم للتنبؤات المستقبلية والقرارات العفوية. التركيب: الفاعل + will + الفعل الأساسي',
    examples: [
      { en: 'I will travel tomorrow.', ar: 'سأسافر غداً.' },
      { en: 'She will help you.', ar: 'ستساعدك.' },
      { en: 'It will rain later.', ar: 'ستمطر لاحقاً.' }
    ],
    notes: 'Also use "going to" for planned future actions',
    notesAr: 'استخدم أيضاً "going to" للأفعال المستقبلية المخطط لها'
  },
  {
    id: '9',
    category: 'Articles',
    categoryAr: 'أدوات التعريف',
    title: 'Definite Article (The)',
    titleAr: 'أداة التعريف (The)',
    description: 'Used for specific nouns known to both speaker and listener.',
    descriptionAr: 'تستخدم للأسماء المحددة المعروفة للمتحدث والمستمع.',
    examples: [
      { en: 'The book on the table is mine.', ar: 'الكتاب على الطاولة لي.' },
      { en: 'I went to the hospital.', ar: 'ذهبت إلى المستشفى.' },
      { en: 'The sun rises in the east.', ar: 'الشمس تشرق من الشرق.' }
    ],
    notes: 'Use with: unique things, superlatives, musical instruments, nationality groups',
    notesAr: 'استخدم مع: الأشياء الفريدة، صيغ التفضيل، الآلات الموسيقية، مجموعات الجنسية'
  },
  {
    id: '10',
    category: 'Articles',
    categoryAr: 'أدوات التعريف',
    title: 'Indefinite Articles (A/An)',
    titleAr: 'أدوات التنكير (A/An)',
    description: 'Used for non-specific singular countable nouns. Use "a" before consonants, "an" before vowels.',
    descriptionAr: 'تستخدم للأسماء المعدودة المفردة غير المحددة. استخدم "a" قبل الحروف الساكنة، "an" قبل حروف العلة.',
    examples: [
      { en: 'I saw a cat in the garden.', ar: 'رأيت قطة في الحديقة.' },
      { en: 'She is an engineer.', ar: 'هي مهندسة.' },
      { en: 'He bought an apple.', ar: 'اشترى تفاحة.' }
    ],
    notes: 'Use "an" with vowel sounds (a, e, i, o, u)',
    notesAr: 'استخدم "an" مع أصوات حروف العلة (a, e, i, o, u)'
  },
  {
    id: '11',
    category: 'Pronouns',
    categoryAr: 'الضمائر',
    title: 'Subject Pronouns',
    titleAr: 'ضمائر الفاعل',
    description: 'Pronouns that act as the subject of a sentence: I, you, he, she, it, we, they',
    descriptionAr: 'الضمائر التي تعمل كفاعل في الجملة: I, you, he, she, it, we, they',
    examples: [
      { en: 'I am a student.', ar: 'أنا طالب.' },
      { en: 'She loves music.', ar: 'هي تحب الموسيقى.' },
      { en: 'They are from Egypt.', ar: 'هم من مصر.' }
    ],
    notes: 'Always capitalize "I"',
    notesAr: 'دائماً اكتب "I" بحرف كبير'
  },
  {
    id: '12',
    category: 'Pronouns',
    categoryAr: 'الضمائر',
    title: 'Object Pronouns',
    titleAr: 'ضمائر المفعول به',
    description: 'Pronouns that receive the action: me, you, him, her, it, us, them',
    descriptionAr: 'الضمائر التي تستقبل الفعل: me, you, him, her, it, us, them',
    examples: [
      { en: 'He called me yesterday.', ar: 'اتصل بي أمس.' },
      { en: 'I love her.', ar: 'أحبها.' },
      { en: 'They invited us to the party.', ar: 'دعونا للحفلة.' }
    ],
    notes: 'Comes after verbs and prepositions',
    notesAr: 'يأتي بعد الأفعال وحروف الجر'
  },
  {
    id: '13',
    category: 'Pronouns',
    categoryAr: 'الضمائر',
    title: 'Possessive Pronouns',
    titleAr: 'ضمائر الملكية',
    description: 'Show ownership: mine, yours, his, hers, its, ours, theirs',
    descriptionAr: 'تظهر الملكية: mine, yours, his, hers, its, ours, theirs',
    examples: [
      { en: 'This book is mine.', ar: 'هذا الكتاب لي.' },
      { en: 'Is this pen yours?', ar: 'هل هذا القلم لك؟' },
      { en: 'The car is theirs.', ar: 'السيارة لهم.' }
    ],
    notes: 'No apostrophe needed',
    notesAr: 'لا حاجة لعلامة الملكية'
  },
  {
    id: '14',
    category: 'Prepositions',
    categoryAr: 'حروف الجر',
    title: 'Prepositions of Place',
    titleAr: 'حروف الجر للمكان',
    description: 'Show location: in, on, at, under, over, between, behind, in front of, next to',
    descriptionAr: 'تظهر الموقع: in, on, at, under, over, between, behind, in front of, next to',
    examples: [
      { en: 'The book is on the table.', ar: 'الكتاب على الطاولة.' },
      { en: 'I live in Cairo.', ar: 'أعيش في القاهرة.' },
      { en: 'She is at school.', ar: 'هي في المدرسة.' }
    ],
    notes: 'in = inside, on = surface, at = specific point',
    notesAr: 'in = بالداخل، on = على السطح، at = نقطة محددة'
  },
  {
    id: '15',
    category: 'Prepositions',
    categoryAr: 'حروف الجر',
    title: 'Prepositions of Time',
    titleAr: 'حروف الجر للوقت',
    description: 'Show when something happens: in, on, at, during, for, since',
    descriptionAr: 'تظهر وقت حدوث شيء: in, on, at, during, for, since',
    examples: [
      { en: 'I wake up at 7 AM.', ar: 'أستيقظ في الساعة 7 صباحاً.' },
      { en: 'My birthday is on Monday.', ar: 'عيد ميلادي يوم الإثنين.' },
      { en: 'I was born in 1995.', ar: 'ولدت في 1995.' }
    ],
    notes: 'at = specific time, on = day/date, in = month/year/season',
    notesAr: 'at = وقت محدد، on = يوم/تاريخ، in = شهر/سنة/موسم'
  },
  {
    id: '16',
    category: 'Adjectives',
    categoryAr: 'الصفات',
    title: 'Comparative Adjectives',
    titleAr: 'الصفات التفضيلية',
    description: 'Compare two things: add -er or use "more". Form: adjective-er than OR more + adjective + than',
    descriptionAr: 'مقارنة شيئين: أضف -er أو استخدم "more". التركيب: صفة+er than أو more + صفة + than',
    examples: [
      { en: 'She is taller than me.', ar: 'هي أطول مني.' },
      { en: 'This book is more interesting than that one.', ar: 'هذا الكتاب أكثر إثارة من ذاك.' },
      { en: 'My car is faster than yours.', ar: 'سيارتي أسرع من سيارتك.' }
    ],
    notes: 'Short adjectives: add -er. Long adjectives: use "more"',
    notesAr: 'الصفات القصيرة: أضف -er. الصفات الطويلة: استخدم "more"'
  },
  {
    id: '17',
    category: 'Adjectives',
    categoryAr: 'الصفات',
    title: 'Superlative Adjectives',
    titleAr: 'صيغة التفضيل',
    description: 'Show the highest degree among three or more: add -est or use "most". Form: the + adjective-est OR the most + adjective',
    descriptionAr: 'تظهر أعلى درجة بين ثلاثة أو أكثر: أضف -est أو استخدم "most". التركيب: the + صفة+est أو the most + صفة',
    examples: [
      { en: 'She is the tallest in the class.', ar: 'هي الأطول في الفصل.' },
      { en: 'This is the most beautiful place.', ar: 'هذا المكان الأجمل.' },
      { en: 'He is the fastest runner.', ar: 'هو العداء الأسرع.' }
    ],
    notes: 'Irregular: good-better-best, bad-worse-worst',
    notesAr: 'شاذة: good-better-best, bad-worse-worst'
  },
  {
    id: '18',
    category: 'Conditionals',
    categoryAr: 'الجمل الشرطية',
    title: 'First Conditional',
    titleAr: 'الشرط الأول',
    description: 'Real possibility in the future. Form: If + present simple, will + base verb',
    descriptionAr: 'احتمال حقيقي في المستقبل. التركيب: If + مضارع بسيط، will + الفعل الأساسي',
    examples: [
      { en: 'If it rains, I will stay home.', ar: 'إذا أمطرت، سأبقى في المنزل.' },
      { en: 'If you study hard, you will pass.', ar: 'إذا درست بجد، ستنجح.' },
      { en: 'If she comes, we will go together.', ar: 'إذا أتت، سنذهب معاً.' }
    ],
    notes: 'Used for likely future situations',
    notesAr: 'يستخدم للمواقف المستقبلية المحتملة'
  },
  {
    id: '19',
    category: 'Conditionals',
    categoryAr: 'الجمل الشرطية',
    title: 'Second Conditional',
    titleAr: 'الشرط الثاني',
    description: 'Unreal or unlikely situation in present/future. Form: If + past simple, would + base verb',
    descriptionAr: 'موقف غير حقيقي أو غير محتمل في الحاضر/المستقبل. التركيب: If + ماضي بسيط، would + الفعل الأساسي',
    examples: [
      { en: 'If I had money, I would buy a car.', ar: 'لو كان عندي مال، لاشتريت سيارة.' },
      { en: 'If she were here, she would help us.', ar: 'لو كانت هنا، لساعدتنا.' },
      { en: 'If I were you, I would study more.', ar: 'لو كنت مكانك، لدرست أكثر.' }
    ],
    notes: 'Use "were" for all subjects with "to be"',
    notesAr: 'استخدم "were" مع جميع الضمائر مع "to be"'
  },
  {
    id: '20',
    category: 'Conditionals',
    categoryAr: 'الجمل الشرطية',
    title: 'Third Conditional',
    titleAr: 'الشرط الثالث',
    description: 'Unreal situation in the past (regret). Form: If + past perfect, would have + past participle',
    descriptionAr: 'موقف غير حقيقي في الماضي (ندم). التركيب: If + ماضي تام، would have + التصريف الثالث',
    examples: [
      { en: 'If I had studied, I would have passed.', ar: 'لو درست، لكنت نجحت.' },
      { en: 'If she had known, she would have come.', ar: 'لو علمت، لكانت أتت.' },
      { en: 'If they had arrived early, they would have seen him.', ar: 'لو وصلوا مبكراً، لكانوا رأوه.' }
    ],
    notes: 'Used for impossible past situations',
    notesAr: 'يستخدم للمواقف الماضية المستحيلة'
  },
  {
    id: '21',
    category: 'Modal Verbs',
    categoryAr: 'الأفعال المساعدة',
    title: 'Can / Could',
    titleAr: 'Can / Could',
    description: 'Can: ability, permission. Could: past ability, polite requests.',
    descriptionAr: 'Can: القدرة، الإذن. Could: القدرة الماضية، الطلبات المهذبة.',
    examples: [
      { en: 'I can speak English.', ar: 'أستطيع التحدث بالإنجليزية.' },
      { en: 'Could you help me, please?', ar: 'هل يمكنك مساعدتي، من فضلك؟' },
      { en: 'I could swim when I was young.', ar: 'كنت أستطيع السباحة عندما كنت صغيراً.' }
    ],
    notes: 'Could is more polite than can for requests',
    notesAr: 'Could أكثر تهذيباً من can للطلبات'
  },
  {
    id: '22',
    category: 'Modal Verbs',
    categoryAr: 'الأفعال المساعدة',
    title: 'Must / Have to',
    titleAr: 'Must / Have to',
    description: 'Both mean obligation. Must: strong personal obligation. Have to: external obligation.',
    descriptionAr: 'كلاهما يعني الالتزام. Must: التزام شخصي قوي. Have to: التزام خارجي.',
    examples: [
      { en: 'I must finish this today.', ar: 'يجب أن أنهي هذا اليوم.' },
      { en: 'You have to wear a uniform.', ar: 'يجب أن ترتدي زياً موحداً.' },
      { en: 'We must study for the exam.', ar: 'يجب أن ندرس للامتحان.' }
    ],
    notes: 'Negative: mustn\'t = prohibition, don\'t have to = no obligation',
    notesAr: 'النفي: mustn\'t = منع، don\'t have to = لا التزام'
  },
  {
    id: '23',
    category: 'Modal Verbs',
    categoryAr: 'الأفعال المساعدة',
    title: 'Should / Ought to',
    titleAr: 'Should / Ought to',
    description: 'Give advice or recommendations.',
    descriptionAr: 'تقديم النصيحة أو التوصيات.',
    examples: [
      { en: 'You should see a doctor.', ar: 'يجب أن ترى طبيباً.' },
      { en: 'We ought to help him.', ar: 'يجب علينا مساعدته.' },
      { en: 'You should study more.', ar: 'يجب أن تدرس أكثر.' }
    ],
    notes: 'Should is more common than ought to',
    notesAr: 'Should أكثر شيوعاً من ought to'
  },
  {
    id: '24',
    category: 'Passive Voice',
    categoryAr: 'المبني للمجهول',
    title: 'Passive Voice',
    titleAr: 'المبني للمجهول',
    description: 'Focus on the action, not the doer. Form: Subject + be + past participle (+ by agent)',
    descriptionAr: 'التركيز على الفعل وليس الفاعل. التركيب: الفاعل + be + التصريف الثالث (+ by الفاعل)',
    examples: [
      { en: 'The book was written by Shakespeare.', ar: 'الكتاب كُتِب بواسطة شكسبير.' },
      { en: 'English is spoken all over the world.', ar: 'الإنجليزية يتم التحدث بها في جميع أنحاء العالم.' },
      { en: 'The house will be built next year.', ar: 'المنزل سيتم بناؤه العام القادم.' }
    ],
    notes: 'Use when the doer is unknown or unimportant',
    notesAr: 'استخدم عندما يكون الفاعل غير معروف أو غير مهم'
  },
  {
    id: '25',
    category: 'Question Formation',
    categoryAr: 'تكوين الأسئلة',
    title: 'Yes/No Questions',
    titleAr: 'أسئلة نعم/لا',
    description: 'Questions answered with yes or no. Form: Auxiliary verb + subject + main verb',
    descriptionAr: 'أسئلة تجاب بنعم أو لا. التركيب: الفعل المساعد + الفاعل + الفعل الأساسي',
    examples: [
      { en: 'Do you speak English?', ar: 'هل تتحدث الإنجليزية؟' },
      { en: 'Is she a teacher?', ar: 'هل هي مدرسة؟' },
      { en: 'Can they come tomorrow?', ar: 'هل يستطيعون القدوم غداً؟' }
    ],
    notes: 'Start with: do/does/did, am/is/are/was/were, can/could/will/would',
    notesAr: 'ابدأ بـ: do/does/did, am/is/are/was/were, can/could/will/would'
  },
  {
    id: '26',
    category: 'Question Formation',
    categoryAr: 'تكوين الأسئلة',
    title: 'Wh-Questions',
    titleAr: 'أسئلة Wh',
    description: 'Questions starting with what, where, when, who, why, how. Form: Wh-word + auxiliary + subject + verb',
    descriptionAr: 'أسئلة تبدأ بـ what, where, when, who, why, how. التركيب: كلمة Wh + الفعل المساعد + الفاعل + الفعل',
    examples: [
      { en: 'What do you do?', ar: 'ماذا تعمل؟' },
      { en: 'Where is she going?', ar: 'أين تذهب؟' },
      { en: 'Why did you leave?', ar: 'لماذا غادرت؟' }
    ],
    notes: 'What = ماذا، Where = أين، When = متى، Who = من، Why = لماذا، How = كيف',
    notesAr: 'What = ماذا، Where = أين، When = متى، Who = من، Why = لماذا، How = كيف'
  },
  {
    id: '27',
    category: 'Reported Speech',
    categoryAr: 'الكلام المنقول',
    title: 'Reported Speech (Statements)',
    titleAr: 'الكلام المنقول (التصريحات)',
    description: 'Report what someone said. Change pronouns and tenses back one step.',
    descriptionAr: 'نقل ما قاله شخص ما. غيّر الضمائر والأزمنة خطوة للوراء.',
    examples: [
      { en: 'Direct: "I am tired." → Reported: He said he was tired.', ar: 'مباشر: "أنا متعب." → منقول: قال إنه كان متعباً.' },
      { en: 'Direct: "I will come." → Reported: She said she would come.', ar: 'مباشر: "سآتي." → منقول: قالت إنها ستأتي.' },
      { en: 'Direct: "I love pizza." → Reported: He said he loved pizza.', ar: 'مباشر: "أحب البيتزا." → منقول: قال إنه يحب البيتزا.' }
    ],
    notes: 'Present → Past, Present Perfect → Past Perfect, Will → Would',
    notesAr: 'المضارع → الماضي، المضارع التام → الماضي التام، Will → Would'
  },
  {
    id: '28',
    category: 'Gerunds and Infinitives',
    categoryAr: 'المصادر والأسماء الفعلية',
    title: 'Gerunds (verb-ing)',
    titleAr: 'الأسماء الفعلية (verb-ing)',
    description: 'Verb used as a noun. After: enjoy, finish, stop, mind, consider, avoid.',
    descriptionAr: 'الفعل يستخدم كاسم. بعد: enjoy, finish, stop, mind, consider, avoid.',
    examples: [
      { en: 'I enjoy reading books.', ar: 'أستمتع بقراءة الكتب.' },
      { en: 'She finished cooking dinner.', ar: 'أنهت طبخ العشاء.' },
      { en: 'They stopped talking.', ar: 'توقفوا عن التحدث.' }
    ],
    notes: 'Also use after prepositions',
    notesAr: 'استخدم أيضاً بعد حروف الجر'
  },
  {
    id: '29',
    category: 'Gerunds and Infinitives',
    categoryAr: 'المصادر والأسماء الفعلية',
    title: 'Infinitives (to + verb)',
    titleAr: 'المصادر (to + verb)',
    description: 'Base verb with "to". After: want, need, decide, plan, hope, promise.',
    descriptionAr: 'الفعل الأساسي مع "to". بعد: want, need, decide, plan, hope, promise.',
    examples: [
      { en: 'I want to learn English.', ar: 'أريد أن أتعلم الإنجليزية.' },
      { en: 'She decided to study abroad.', ar: 'قررت الدراسة بالخارج.' },
      { en: 'They plan to travel next month.', ar: 'يخططون للسفر الشهر القادم.' }
    ],
    notes: 'Some verbs can take both gerund and infinitive',
    notesAr: 'بعض الأفعال يمكن أن تأخذ كلاً من المصدر والاسم الفعلي'
  },
  {
    id: '30',
    category: 'Relative Clauses',
    categoryAr: 'جمل الصلة',
    title: 'Relative Pronouns',
    titleAr: 'ضمائر الصلة',
    description: 'Connect clauses: who (people), which (things), that (both), whose (possession), where (place)',
    descriptionAr: 'ربط الجمل: who (أشخاص)، which (أشياء)، that (كلاهما)، whose (ملكية)، where (مكان)',
    examples: [
      { en: 'The man who lives next door is a doctor.', ar: 'الرجل الذي يعيش في الباب المجاور طبيب.' },
      { en: 'The book which I bought is interesting.', ar: 'الكتاب الذي اشتريته مثير.' },
      { en: 'The house where I was born is old.', ar: 'المنزل الذي ولدت فيه قديم.' }
    ],
    notes: 'Who = for people, Which = for things, That = for both',
    notesAr: 'Who = للأشخاص، Which = للأشياء، That = لكليهما'
  }
]

export function searchGrammarRules(query: string): GrammarRule[] {
  if (!query.trim()) return grammarRules
  
  const lowerQuery = query.toLowerCase()
  return grammarRules.filter(rule => 
    rule.title.toLowerCase().includes(lowerQuery) ||
    rule.titleAr.includes(query) ||
    rule.category.toLowerCase().includes(lowerQuery) ||
    rule.categoryAr.includes(query) ||
    rule.description.toLowerCase().includes(lowerQuery) ||
    rule.descriptionAr.includes(query)
  )
}

export function getGrammarCategories(): { en: string, ar: string }[] {
  const categories = new Map<string, string>()
  grammarRules.forEach(rule => {
    categories.set(rule.category, rule.categoryAr)
  })
  return Array.from(categories.entries()).map(([en, ar]) => ({ en, ar }))
}
