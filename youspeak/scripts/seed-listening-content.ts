import { PrismaClient, ListeningMediaType, ListeningExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

const listeningContents = [
  // BEGINNER LEVEL - Simple conversations and basic English
  {
    title: "Greetings and Introductions",
    titleAr: "التحيات والتعريف بالنفس",
    description: "Learn how to greet people and introduce yourself in English",
    descriptionAr: "تعلم كيفية تحية الناس وتقديم نفسك بالإنجليزية",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/oVxBgLJgHuY",
    duration: 240,
    level: "BEGINNER",
    category: "Conversations",
    categoryAr: "محادثات",
    transcript: "Hello! My name is John. What's your name? Nice to meet you. I'm from New York. Where are you from? I'm a student. What do you do? It's nice talking to you. See you later. Goodbye!",
    transcriptAr: "مرحباً! اسمي جون. ما اسمك؟ سعيد بلقائك. أنا من نيويورك. من أين أنت؟ أنا طالب. ماذا تعمل؟ سعدت بالتحدث معك. أراك لاحقاً. مع السلامة!",
    order: 1,
  },
  {
    title: "Numbers and Counting",
    titleAr: "الأرقام والعد",
    description: "Learn numbers from 1 to 100 in English with clear pronunciation",
    descriptionAr: "تعلم الأرقام من 1 إلى 100 بالإنجليزية مع النطق الواضح",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/DR-cfDsHCGA",
    duration: 300,
    level: "BEGINNER",
    category: "Vocabulary",
    categoryAr: "مفردات",
    transcript: "One, two, three, four, five, six, seven, eight, nine, ten. Eleven, twelve, thirteen, fourteen, fifteen. Twenty, thirty, forty, fifty. One hundred.",
    transcriptAr: "واحد، اثنان، ثلاثة، أربعة، خمسة، ستة، سبعة، ثمانية، تسعة، عشرة. أحد عشر، اثنا عشر، ثلاثة عشر، أربعة عشر، خمسة عشر. عشرون، ثلاثون، أربعون، خمسون. مائة.",
    order: 2,
  },
  {
    title: "Days of the Week and Months",
    titleAr: "أيام الأسبوع والأشهر",
    description: "Learn the days of the week and months of the year",
    descriptionAr: "تعلم أيام الأسبوع وأشهر السنة",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/LIQsyHoLudQ",
    duration: 180,
    level: "BEGINNER",
    category: "Vocabulary",
    categoryAr: "مفردات",
    transcript: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. January, February, March, April, May, June, July, August, September, October, November, December.",
    transcriptAr: "الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت، الأحد. يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر.",
    order: 3,
  },
  {
    title: "At the Supermarket",
    titleAr: "في السوبر ماركت",
    description: "Learn shopping vocabulary and common phrases at the supermarket",
    descriptionAr: "تعلم مفردات التسوق والعبارات الشائعة في السوبر ماركت",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/VBWnN3xHQFM",
    duration: 320,
    level: "BEGINNER",
    category: "Shopping",
    categoryAr: "تسوق",
    transcript: "Excuse me, where can I find the milk? It's in aisle three. How much is this? It's five dollars. Do you have a smaller size? I'd like a bag, please. Can I pay by card? Here's your receipt. Thank you, have a nice day!",
    transcriptAr: "عذراً، أين يمكنني أن أجد الحليب؟ إنه في الممر الثالث. كم سعر هذا؟ خمسة دولارات. هل لديكم مقاس أصغر؟ أريد كيساً من فضلك. هل يمكنني الدفع بالبطاقة؟ هذه فاتورتك. شكراً، يوماً سعيداً!",
    order: 4,
  },
  {
    title: "Family Members",
    titleAr: "أفراد العائلة",
    description: "Learn vocabulary for family members in English",
    descriptionAr: "تعلم مفردات أفراد العائلة بالإنجليزية",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/FHaObkHEkHQ",
    duration: 250,
    level: "BEGINNER",
    category: "Vocabulary",
    categoryAr: "مفردات",
    transcript: "This is my family. My father is a doctor. My mother is a teacher. I have one brother and two sisters. My grandfather and grandmother live with us. My uncle and aunt visit us every weekend. I love my family very much.",
    transcriptAr: "هذه عائلتي. والدي طبيب. أمي معلمة. لدي أخ واحد وأختان. جدي وجدتي يعيشان معنا. عمي وعمتي يزوراننا كل عطلة أسبوع. أحب عائلتي كثيراً.",
    order: 5,
  },
  
  // INTERMEDIATE LEVEL - More complex conversations and topics
  {
    title: "Job Interview Conversation",
    titleAr: "محادثة مقابلة العمل",
    description: "Practice common job interview questions and answers",
    descriptionAr: "تدرب على أسئلة وأجوبة مقابلات العمل الشائعة",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/1mHjMNZZvFo",
    duration: 420,
    level: "INTERMEDIATE",
    category: "Business",
    categoryAr: "أعمال",
    transcript: "Tell me about yourself. I graduated from university three years ago. I have experience in marketing. Why do you want to work here? I admire your company's innovation. What are your strengths? I'm a good team player and I work well under pressure. Where do you see yourself in five years? I hope to grow with the company.",
    transcriptAr: "حدثني عن نفسك. تخرجت من الجامعة منذ ثلاث سنوات. لدي خبرة في التسويق. لماذا تريد العمل هنا؟ أنا معجب بابتكار شركتكم. ما هي نقاط قوتك؟ أنا جيد في العمل الجماعي وأعمل جيداً تحت الضغط. أين ترى نفسك بعد خمس سنوات؟ آمل أن أنمو مع الشركة.",
    order: 6,
  },
  {
    title: "At the Doctor's Office",
    titleAr: "في عيادة الطبيب",
    description: "Learn medical vocabulary and how to describe symptoms",
    descriptionAr: "تعلم المفردات الطبية وكيفية وصف الأعراض",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/pLkHFkgnqkY",
    duration: 380,
    level: "INTERMEDIATE",
    category: "Health",
    categoryAr: "صحة",
    transcript: "What seems to be the problem? I've had a headache for three days. Do you have any other symptoms? Yes, I also have a fever and sore throat. Let me check your temperature. It's a bit high. I'll prescribe some medicine. Take these tablets twice a day. Drink plenty of water and get some rest.",
    transcriptAr: "ما هي المشكلة؟ لدي صداع منذ ثلاثة أيام. هل لديك أعراض أخرى؟ نعم، لدي أيضاً حمى والتهاب في الحلق. دعني أفحص حرارتك. إنها مرتفعة قليلاً. سأصف لك بعض الأدوية. تناول هذه الأقراص مرتين يومياً. اشرب الكثير من الماء واحصل على بعض الراحة.",
    order: 7,
  },
  {
    title: "Making Travel Plans",
    titleAr: "التخطيط للسفر",
    description: "Learn how to discuss and plan trips in English",
    descriptionAr: "تعلم كيفية مناقشة الرحلات والتخطيط لها بالإنجليزية",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/PAOa-ltdCqE",
    duration: 350,
    level: "INTERMEDIATE",
    category: "Travel",
    categoryAr: "سفر",
    transcript: "Where would you like to go on vacation? I've always wanted to visit Paris. When are you planning to travel? I'm thinking about next summer. How long will you stay? About two weeks. Have you booked your flight yet? Not yet, I'm comparing prices. Don't forget to get travel insurance.",
    transcriptAr: "أين تريد الذهاب في الإجازة؟ لطالما أردت زيارة باريس. متى تخطط للسفر؟ أفكر في الصيف القادم. كم ستبقى؟ حوالي أسبوعين. هل حجزت رحلتك بعد؟ ليس بعد، أنا أقارن الأسعار. لا تنس الحصول على تأمين السفر.",
    order: 8,
  },
  {
    title: "Technology and Gadgets",
    titleAr: "التكنولوجيا والأجهزة",
    description: "Learn vocabulary about smartphones, computers, and technology",
    descriptionAr: "تعلم مفردات الهواتف الذكية والحواسيب والتكنولوجيا",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/Iz5FtM3dqBg",
    duration: 400,
    level: "INTERMEDIATE",
    category: "Technology",
    categoryAr: "تكنولوجيا",
    transcript: "My phone battery died. Can I borrow your charger? Sure, here you go. I need to download this app. Make sure you have enough storage. My computer is running slowly. Have you tried restarting it? I'll back up my files to the cloud. Don't forget to update your software.",
    transcriptAr: "نفدت بطارية هاتفي. هل يمكنني استعارة شاحنك؟ بالتأكيد، تفضل. أحتاج لتحميل هذا التطبيق. تأكد أن لديك مساحة تخزين كافية. حاسوبي بطيء. هل جربت إعادة تشغيله؟ سأحفظ ملفاتي في السحابة. لا تنس تحديث برامجك.",
    order: 9,
  },
  {
    title: "Ordering at a Restaurant",
    titleAr: "الطلب في المطعم",
    description: "Practice restaurant vocabulary and ordering food",
    descriptionAr: "تدرب على مفردات المطعم وطلب الطعام",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/ekK7peRxKGc",
    duration: 360,
    level: "INTERMEDIATE",
    category: "Food",
    categoryAr: "طعام",
    transcript: "Good evening, do you have a reservation? Yes, for two under the name Smith. Here's your table. Can I see the menu, please? Are you ready to order? I'll have the grilled salmon. How would you like it cooked? Medium, please. Would you like anything to drink? A glass of water, please. Enjoy your meal!",
    transcriptAr: "مساء الخير، هل لديكم حجز؟ نعم، لشخصين باسم سميث. هذه طاولتكم. هل يمكنني رؤية القائمة من فضلك؟ هل أنتم جاهزون للطلب؟ سآخذ السلمون المشوي. كيف تريده مطبوخاً؟ متوسط، من فضلك. هل تريد شيئاً للشرب؟ كأس ماء، من فضلك. بالعافية!",
    order: 10,
  },
  
  // ADVANCED LEVEL - Complex topics and fluent speech
  {
    title: "Business Negotiation",
    titleAr: "التفاوض التجاري",
    description: "Advanced business English for negotiations and deals",
    descriptionAr: "إنجليزي أعمال متقدم للتفاوض والصفقات",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/CJKzCWE6eAQ",
    duration: 480,
    level: "ADVANCED",
    category: "Business",
    categoryAr: "أعمال",
    transcript: "We need to discuss the terms of this contract. Our initial offer is quite competitive. However, we believe there's room for negotiation on the delivery timeline. What's your bottom line? We can offer a ten percent discount for orders over a thousand units. That's a reasonable compromise. Let's schedule a follow-up meeting to finalize the details.",
    transcriptAr: "نحتاج لمناقشة شروط هذا العقد. عرضنا الأولي تنافسي جداً. ومع ذلك، نعتقد أن هناك مجالاً للتفاوض على الجدول الزمني للتسليم. ما هو الحد الأدنى لكم؟ يمكننا تقديم خصم عشرة بالمائة للطلبات التي تزيد عن ألف وحدة. هذا حل وسط معقول. لنحدد اجتماع متابعة لإنهاء التفاصيل.",
    order: 11,
  },
  {
    title: "Environmental Issues Discussion",
    titleAr: "مناقشة القضايا البيئية",
    description: "Advanced vocabulary about climate change and environment",
    descriptionAr: "مفردات متقدمة عن تغير المناخ والبيئة",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/OWXoRSIxyIU",
    duration: 520,
    level: "ADVANCED",
    category: "Environment",
    categoryAr: "بيئة",
    transcript: "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing unprecedented weather patterns. We need to reduce our carbon footprint significantly. Renewable energy sources like solar and wind power are becoming more affordable. Sustainable practices in agriculture and industry are essential. Every individual can make a difference through conscious choices.",
    transcriptAr: "تغير المناخ هو أحد أكثر القضايا إلحاحاً في عصرنا. ارتفاع درجات الحرارة العالمية يسبب أنماط طقس غير مسبوقة. نحتاج لتقليل بصمتنا الكربونية بشكل كبير. مصادر الطاقة المتجددة كالطاقة الشمسية والرياح أصبحت أكثر تكلفة. الممارسات المستدامة في الزراعة والصناعة ضرورية. كل فرد يمكنه إحداث فرق من خلال الاختيارات الواعية.",
    order: 12,
  },
  {
    title: "Academic Presentation Skills",
    titleAr: "مهارات العرض الأكاديمي",
    description: "Learn how to give professional academic presentations",
    descriptionAr: "تعلم كيفية تقديم عروض أكاديمية احترافية",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/Unzc731iCUY",
    duration: 450,
    level: "ADVANCED",
    category: "Academic",
    categoryAr: "أكاديمي",
    transcript: "Good morning, everyone. Today I'll be presenting my research on artificial intelligence. Let me begin with an overview of my methodology. The data was collected over a six-month period. As you can see from this graph, the results are statistically significant. In conclusion, our findings suggest several implications for future research. I'd be happy to take any questions.",
    transcriptAr: "صباح الخير للجميع. اليوم سأقدم بحثي عن الذكاء الاصطناعي. دعوني أبدأ بنظرة عامة على منهجيتي. تم جمع البيانات على مدى ستة أشهر. كما ترون من هذا الرسم البياني، النتائج ذات دلالة إحصائية. في الختام، نتائجنا تشير إلى عدة تداعيات للبحث المستقبلي. يسعدني تلقي أي أسئلة.",
    order: 13,
  },
  {
    title: "News Report: Global Economy",
    titleAr: "تقرير إخباري: الاقتصاد العالمي",
    description: "Practice listening to news-style English about economics",
    descriptionAr: "تدرب على الاستماع للإنجليزية الإخبارية عن الاقتصاد",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/PHe0bXAIuk0",
    duration: 400,
    level: "ADVANCED",
    category: "News",
    categoryAr: "أخبار",
    transcript: "In today's financial news, global markets showed mixed results following the central bank's interest rate announcement. Analysts predict continued volatility in the coming weeks. The unemployment rate dropped to its lowest level in five years. Meanwhile, inflation concerns remain a key topic among policymakers. Experts recommend diversifying investment portfolios during uncertain times.",
    transcriptAr: "في أخبار المال اليوم، أظهرت الأسواق العالمية نتائج متباينة بعد إعلان البنك المركزي عن أسعار الفائدة. يتوقع المحللون استمرار التقلبات في الأسابيع المقبلة. انخفض معدل البطالة إلى أدنى مستوى له في خمس سنوات. في غضون ذلك، تبقى مخاوف التضخم موضوعاً رئيسياً بين صناع السياسات. ينصح الخبراء بتنويع المحافظ الاستثمارية في أوقات عدم اليقين.",
    order: 14,
  },
  {
    title: "Medical English: Patient Consultation",
    titleAr: "الإنجليزية الطبية: استشارة المريض",
    description: "Advanced medical vocabulary and doctor-patient dialogue",
    descriptionAr: "مفردات طبية متقدمة وحوار بين الطبيب والمريض",
    mediaType: ListeningMediaType.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/pCvZtjoRt1c",
    duration: 440,
    level: "ADVANCED",
    category: "Medical",
    categoryAr: "طبي",
    transcript: "Based on your symptoms and the test results, I'm going to recommend a course of treatment. Your blood pressure is slightly elevated, so we need to monitor that closely. I'm prescribing a low dose of medication to start. It's important to maintain a balanced diet and regular exercise. We should schedule a follow-up appointment in two weeks to assess your progress.",
    transcriptAr: "بناءً على أعراضك ونتائج الفحوصات، سأوصي بمسار علاجي. ضغط دمك مرتفع قليلاً، لذا نحتاج لمراقبته عن كثب. سأصف جرعة منخفضة من الدواء للبداية. من المهم الحفاظ على نظام غذائي متوازن وممارسة الرياضة بانتظام. يجب أن نحدد موعد متابعة خلال أسبوعين لتقييم تقدمك.",
    order: 15,
  },
];

const exercisesData = [
  // Exercises for "Greetings and Introductions"
  {
    contentOrder: 1,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What does John say his name is?",
        questionAr: "ماذا يقول جون اسمه؟",
        options: JSON.stringify(["John", "Mike", "Tom", "David"]),
        correctAnswer: "John",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "John says 'Nice to meet you' when he introduces himself.",
        questionAr: "يقول جون 'سعيد بلقائك' عندما يقدم نفسه.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Hello! My ___ is John.",
        questionAr: "مرحباً! ___ جون.",
        correctAnswer: "name",
        order: 3,
      },
    ],
  },
  // Exercises for "Numbers and Counting"
  {
    contentOrder: 2,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What number comes after twelve?",
        questionAr: "ما الرقم الذي يأتي بعد اثني عشر؟",
        options: JSON.stringify(["Eleven", "Thirteen", "Fourteen", "Fifteen"]),
        correctAnswer: "Thirteen",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "Fifty comes before forty.",
        questionAr: "خمسون يأتي قبل أربعون.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "false",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Ten, twenty, ___, forty, fifty.",
        questionAr: "عشرة، عشرون، ___، أربعون، خمسون.",
        correctAnswer: "thirty",
        order: 3,
      },
    ],
  },
  // Exercises for "Days and Months"
  {
    contentOrder: 3,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "Which day comes after Wednesday?",
        questionAr: "أي يوم يأتي بعد الأربعاء؟",
        options: JSON.stringify(["Tuesday", "Thursday", "Friday", "Monday"]),
        correctAnswer: "Thursday",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "December is the last month of the year.",
        questionAr: "ديسمبر هو آخر شهر في السنة.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Monday, Tuesday, ___, Thursday.",
        questionAr: "الإثنين، الثلاثاء، ___، الخميس.",
        correctAnswer: "Wednesday",
        order: 3,
      },
    ],
  },
  // Exercises for "At the Supermarket"
  {
    contentOrder: 4,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "Where is the milk?",
        questionAr: "أين الحليب؟",
        options: JSON.stringify(["Aisle one", "Aisle two", "Aisle three", "Aisle four"]),
        correctAnswer: "Aisle three",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The item costs five dollars.",
        questionAr: "السلعة تكلف خمسة دولارات.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Can I pay by ___?",
        questionAr: "هل يمكنني الدفع بـ___؟",
        correctAnswer: "card",
        order: 3,
      },
    ],
  },
  // Exercises for "Family Members"
  {
    contentOrder: 5,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What is the father's job?",
        questionAr: "ما هي وظيفة الأب؟",
        options: JSON.stringify(["Teacher", "Doctor", "Engineer", "Lawyer"]),
        correctAnswer: "Doctor",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The speaker has two brothers.",
        questionAr: "المتحدث لديه أخوان.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "false",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "My mother is a ___.",
        questionAr: "أمي ___.",
        correctAnswer: "teacher",
        order: 3,
      },
    ],
  },
  // Exercises for "Job Interview"
  {
    contentOrder: 6,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "How long ago did the person graduate?",
        questionAr: "منذ كم سنة تخرج الشخص؟",
        options: JSON.stringify(["Two years", "Three years", "Four years", "Five years"]),
        correctAnswer: "Three years",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The person has experience in marketing.",
        questionAr: "الشخص لديه خبرة في التسويق.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "I'm a good team ___ and I work well under pressure.",
        questionAr: "أنا جيد في العمل ___ وأعمل جيداً تحت الضغط.",
        correctAnswer: "player",
        order: 3,
      },
    ],
  },
  // Exercises for "At the Doctor's Office"
  {
    contentOrder: 7,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "How long has the patient had a headache?",
        questionAr: "منذ كم يوم يعاني المريض من صداع؟",
        options: JSON.stringify(["One day", "Two days", "Three days", "Four days"]),
        correctAnswer: "Three days",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The patient also has a sore throat.",
        questionAr: "المريض لديه أيضاً التهاب في الحلق.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Take these tablets ___ a day.",
        questionAr: "تناول هذه الأقراص ___ يومياً.",
        correctAnswer: "twice",
        order: 3,
      },
    ],
  },
  // Exercises for "Travel Plans"
  {
    contentOrder: 8,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "Where does the person want to visit?",
        questionAr: "أين يريد الشخص أن يزور؟",
        options: JSON.stringify(["London", "Paris", "Rome", "Madrid"]),
        correctAnswer: "Paris",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The person plans to stay for about two weeks.",
        questionAr: "الشخص يخطط للبقاء حوالي أسبوعين.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Don't forget to get travel ___.",
        questionAr: "لا تنس الحصول على ___ السفر.",
        correctAnswer: "insurance",
        order: 3,
      },
    ],
  },
  // Exercises for "Technology"
  {
    contentOrder: 9,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What happened to the phone?",
        questionAr: "ماذا حدث للهاتف؟",
        options: JSON.stringify(["It broke", "The battery died", "It was lost", "The screen cracked"]),
        correctAnswer: "The battery died",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The person suggests restarting the computer.",
        questionAr: "الشخص يقترح إعادة تشغيل الحاسوب.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "I'll back up my files to the ___.",
        questionAr: "سأحفظ ملفاتي في ___.",
        correctAnswer: "cloud",
        order: 3,
      },
    ],
  },
  // Exercises for "Restaurant"
  {
    contentOrder: 10,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What did the customer order?",
        questionAr: "ماذا طلب الزبون؟",
        options: JSON.stringify(["Grilled chicken", "Grilled salmon", "Steak", "Pasta"]),
        correctAnswer: "Grilled salmon",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The reservation was for three people.",
        questionAr: "الحجز كان لثلاثة أشخاص.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "false",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "How would you like it ___?",
        questionAr: "كيف تريده ___؟",
        correctAnswer: "cooked",
        order: 3,
      },
    ],
  },
  // Exercises for "Business Negotiation"
  {
    contentOrder: 11,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What discount is offered for large orders?",
        questionAr: "ما الخصم المقدم للطلبات الكبيرة؟",
        options: JSON.stringify(["Five percent", "Ten percent", "Fifteen percent", "Twenty percent"]),
        correctAnswer: "Ten percent",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The discount applies to orders over 1000 units.",
        questionAr: "الخصم ينطبق على الطلبات التي تزيد عن 1000 وحدة.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Let's schedule a follow-up ___ to finalize the details.",
        questionAr: "لنحدد ___ متابعة لإنهاء التفاصيل.",
        correctAnswer: "meeting",
        order: 3,
      },
    ],
  },
  // Exercises for "Environment"
  {
    contentOrder: 12,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What are becoming more affordable according to the text?",
        questionAr: "ما الذي أصبح أكثر تكلفة حسب النص؟",
        options: JSON.stringify(["Fossil fuels", "Nuclear energy", "Renewable energy sources", "Gas prices"]),
        correctAnswer: "Renewable energy sources",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "Rising temperatures cause unprecedented weather patterns.",
        questionAr: "ارتفاع درجات الحرارة يسبب أنماط طقس غير مسبوقة.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "We need to reduce our carbon ___.",
        questionAr: "نحتاج لتقليل ___ الكربونية.",
        correctAnswer: "footprint",
        order: 3,
      },
    ],
  },
  // Exercises for "Academic Presentation"
  {
    contentOrder: 13,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "What is the research topic?",
        questionAr: "ما هو موضوع البحث؟",
        options: JSON.stringify(["Biology", "Artificial intelligence", "Chemistry", "Physics"]),
        correctAnswer: "Artificial intelligence",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "Data was collected over a six-month period.",
        questionAr: "تم جمع البيانات على مدى ستة أشهر.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "The results are statistically ___.",
        questionAr: "النتائج ذات دلالة ___.",
        correctAnswer: "significant",
        order: 3,
      },
    ],
  },
  // Exercises for "News Report"
  {
    contentOrder: 14,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "The unemployment rate dropped to its lowest level in how many years?",
        questionAr: "انخفض معدل البطالة إلى أدنى مستوى له في كم سنة؟",
        options: JSON.stringify(["Three years", "Four years", "Five years", "Six years"]),
        correctAnswer: "Five years",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "Experts recommend diversifying investment portfolios.",
        questionAr: "ينصح الخبراء بتنويع المحافظ الاستثمارية.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "Inflation concerns remain a key ___ among policymakers.",
        questionAr: "تبقى مخاوف التضخم ___ رئيسياً بين صناع السياسات.",
        correctAnswer: "topic",
        order: 3,
      },
    ],
  },
  // Exercises for "Medical English"
  {
    contentOrder: 15,
    exercises: [
      {
        type: ListeningExerciseType.MULTIPLE_CHOICE,
        question: "When is the follow-up appointment scheduled?",
        questionAr: "متى موعد المتابعة؟",
        options: JSON.stringify(["One week", "Two weeks", "Three weeks", "One month"]),
        correctAnswer: "Two weeks",
        order: 1,
      },
      {
        type: ListeningExerciseType.TRUE_FALSE,
        question: "The patient's blood pressure is slightly elevated.",
        questionAr: "ضغط دم المريض مرتفع قليلاً.",
        options: JSON.stringify(["True", "False"]),
        correctAnswer: "true",
        order: 2,
      },
      {
        type: ListeningExerciseType.FILL_BLANK,
        question: "It's important to maintain a balanced ___ and regular exercise.",
        questionAr: "من المهم الحفاظ على ___ متوازن وممارسة الرياضة بانتظام.",
        correctAnswer: "diet",
        order: 3,
      },
    ],
  },
];

async function main() {
  console.log('🎧 Seeding listening content with real YouTube English learning videos...');
  
  // Delete existing content
  console.log('Deleting existing listening exercises...');
  await prisma.listeningExercise.deleteMany({});
  console.log('Deleting existing listening content...');
  await prisma.listeningContent.deleteMany({});
  
  // Create listening contents
  for (const content of listeningContents) {
    console.log(`Creating: ${content.title}`);
    const createdContent = await prisma.listeningContent.create({
      data: {
        ...content,
        isPublished: true,
      },
    });
    
    // Find and create exercises for this content
    const contentExercises = exercisesData.find(e => e.contentOrder === content.order);
    if (contentExercises) {
      for (const exercise of contentExercises.exercises) {
        await prisma.listeningExercise.create({
          data: {
            ...exercise,
            contentId: createdContent.id,
          },
        });
      }
      console.log(`  ✓ Added ${contentExercises.exercises.length} exercises`);
    }
  }
  
  console.log('\n✅ Successfully seeded 15 listening contents with YouTube videos!');
  console.log('📹 All videos are from real English learning YouTube channels');
  console.log('📝 Each content has 3 exercises (Multiple Choice, True/False, Fill in the Blank)');
}

main()
  .catch((e) => {
    console.error('Error seeding listening content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
