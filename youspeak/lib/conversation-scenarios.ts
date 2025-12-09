export interface DialogueStep {
  id: number
  speaker: 'system' | 'student'
  message: string
  messageAr: string
  options?: {
    id: number
    text: string
    textAr: string
    isCorrect: boolean
    feedback?: string
    feedbackAr?: string
  }[]
  nextStep?: number
}

export interface ConversationScenarioData {
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  dialogueSteps: DialogueStep[]
}

export const conversationScenarios: ConversationScenarioData[] = [
  {
    title: "At the Restaurant",
    titleAr: "في المطعم",
    description: "Practice ordering food and drinks at a restaurant",
    descriptionAr: "تدرب على طلب الطعام والمشروبات في المطعم",
    category: "Restaurant",
    categoryAr: "مطعم",
    level: "BEGINNER",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Waiter: Good evening! Welcome to our restaurant. How many people?",
        messageAr: "النادل: مساء الخير! أهلاً بك في مطعمنا. كم عدد الأشخاص؟",
        options: [
          { id: 1, text: "A table for two, please.", textAr: "طاولة لشخصين، من فضلك.", isCorrect: true, feedback: "Perfect! That's the correct way to ask.", feedbackAr: "ممتاز! هذه الطريقة الصحيحة للسؤال." },
          { id: 2, text: "I want eat.", textAr: "أريد أكل.", isCorrect: false, feedback: "Try saying 'A table for two, please' instead.", feedbackAr: "حاول قول 'A table for two, please' بدلاً من ذلك." },
          { id: 3, text: "Two person.", textAr: "شخصين.", isCorrect: false, feedback: "It's better to say 'A table for two, please'.", feedbackAr: "من الأفضل أن تقول 'A table for two, please'." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Waiter: Right this way, please. Here is your menu. Can I get you something to drink?",
        messageAr: "النادل: من هنا، من فضلك. هذه قائمة الطعام. هل تريد شيئاً للشرب؟",
        options: [
          { id: 1, text: "Yes, I would like a glass of water, please.", textAr: "نعم، أريد كوب ماء، من فضلك.", isCorrect: true, feedback: "Excellent! Very polite way to order.", feedbackAr: "ممتاز! طريقة مهذبة جداً للطلب." },
          { id: 2, text: "Water.", textAr: "ماء.", isCorrect: false, feedback: "Add 'please' and make it a full sentence.", feedbackAr: "أضف 'please' واجعلها جملة كاملة." },
          { id: 3, text: "Give me water.", textAr: "أعطني ماء.", isCorrect: false, feedback: "Try 'I would like' to be more polite.", feedbackAr: "استخدم 'I would like' لتكون أكثر تهذيباً." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Waiter: Here's your water. Are you ready to order?",
        messageAr: "النادل: تفضل الماء. هل أنت مستعد للطلب؟",
        options: [
          { id: 1, text: "Yes, I'll have the grilled chicken with rice, please.", textAr: "نعم، سآخذ الدجاج المشوي مع الأرز، من فضلك.", isCorrect: true, feedback: "Great job! That's how you order food.", feedbackAr: "أحسنت! هكذا تطلب الطعام." },
          { id: 2, text: "Chicken.", textAr: "دجاج.", isCorrect: false, feedback: "Be more specific and polite.", feedbackAr: "كن أكثر تحديداً وتهذيباً." },
          { id: 3, text: "I want chicken and rice.", textAr: "أريد دجاج وأرز.", isCorrect: false, feedback: "Good, but 'I'll have' sounds more natural.", feedbackAr: "جيد، لكن 'I'll have' تبدو أكثر طبيعية." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Waiter: Excellent choice! Would you like anything else?",
        messageAr: "النادل: اختيار ممتاز! هل تريد شيئاً آخر؟",
        options: [
          { id: 1, text: "No, thank you. That will be all.", textAr: "لا، شكراً. هذا كل شيء.", isCorrect: true, feedback: "Perfect response!", feedbackAr: "إجابة مثالية!" },
          { id: 2, text: "No.", textAr: "لا.", isCorrect: false, feedback: "Add 'thank you' to be polite.", feedbackAr: "أضف 'thank you' لتكون مهذباً." },
          { id: 3, text: "Nothing.", textAr: "لا شيء.", isCorrect: false, feedback: "Try 'No, thank you' instead.", feedbackAr: "قل 'No, thank you' بدلاً من ذلك." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Waiter: Here's your food. Enjoy your meal!",
        messageAr: "النادل: تفضل طعامك. بالعافية!",
        options: [
          { id: 1, text: "Thank you very much!", textAr: "شكراً جزيلاً!", isCorrect: true, feedback: "Wonderful! You completed the conversation.", feedbackAr: "رائع! لقد أكملت المحادثة." }
        ]
      }
    ]
  },
  {
    title: "At the Airport",
    titleAr: "في المطار",
    description: "Practice checking in and going through airport procedures",
    descriptionAr: "تدرب على إجراءات المطار وتسجيل الوصول",
    category: "Travel",
    categoryAr: "سفر",
    level: "INTERMEDIATE",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Agent: Good morning! May I see your passport and booking confirmation?",
        messageAr: "الموظف: صباح الخير! هل يمكنني رؤية جواز سفرك وتأكيد الحجز؟",
        options: [
          { id: 1, text: "Of course, here they are.", textAr: "بالطبع، تفضل.", isCorrect: true, feedback: "Great response!", feedbackAr: "إجابة رائعة!" },
          { id: 2, text: "Here.", textAr: "هنا.", isCorrect: false, feedback: "Be more complete: 'Of course, here they are'.", feedbackAr: "كن أكثر اكتمالاً: 'Of course, here they are'." },
          { id: 3, text: "Take.", textAr: "خذ.", isCorrect: false, feedback: "Try 'Here they are' or 'Of course'.", feedbackAr: "قل 'Here they are' أو 'Of course'." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Agent: Thank you. Would you like a window seat or an aisle seat?",
        messageAr: "الموظف: شكراً. هل تفضل مقعد بجانب النافذة أم الممر؟",
        options: [
          { id: 1, text: "I'd prefer a window seat, please.", textAr: "أفضل مقعد بجانب النافذة، من فضلك.", isCorrect: true, feedback: "Perfect! You expressed your preference clearly.", feedbackAr: "ممتاز! عبرت عن تفضيلك بوضوح." },
          { id: 2, text: "Window.", textAr: "نافذة.", isCorrect: false, feedback: "Try 'I'd prefer a window seat, please'.", feedbackAr: "قل 'I'd prefer a window seat, please'." },
          { id: 3, text: "I want window.", textAr: "أريد نافذة.", isCorrect: false, feedback: "Use 'I'd prefer' for politeness.", feedbackAr: "استخدم 'I'd prefer' للتهذيب." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Agent: Do you have any luggage to check in?",
        messageAr: "الموظف: هل لديك أي أمتعة لتسجيلها؟",
        options: [
          { id: 1, text: "Yes, I have one suitcase to check in.", textAr: "نعم، لدي حقيبة واحدة لتسجيلها.", isCorrect: true, feedback: "Good job!", feedbackAr: "أحسنت!" },
          { id: 2, text: "One bag.", textAr: "حقيبة واحدة.", isCorrect: false, feedback: "Make it a complete sentence.", feedbackAr: "اجعلها جملة كاملة." },
          { id: 3, text: "Yes, one.", textAr: "نعم، واحدة.", isCorrect: false, feedback: "Be more specific about what you're checking.", feedbackAr: "كن أكثر تحديداً عما تسجله." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Agent: Here's your boarding pass. Your gate is B7, and boarding starts at 10:30.",
        messageAr: "الموظف: تفضل بطاقة الصعود. بوابتك B7، ويبدأ الصعود الساعة 10:30.",
        options: [
          { id: 1, text: "Thank you. Which way to the gate?", textAr: "شكراً. ما هو الطريق للبوابة؟", isCorrect: true, feedback: "Excellent! Good question to ask.", feedbackAr: "ممتاز! سؤال جيد." },
          { id: 2, text: "Where gate?", textAr: "أين البوابة؟", isCorrect: false, feedback: "Try 'Which way to the gate?'", feedbackAr: "قل 'Which way to the gate?'" },
          { id: 3, text: "OK.", textAr: "حسناً.", isCorrect: false, feedback: "You can ask for directions too.", feedbackAr: "يمكنك أيضاً السؤال عن الاتجاهات." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Agent: Go straight and turn left after security. Have a pleasant flight!",
        messageAr: "الموظف: امشِ مباشرة واتجه يساراً بعد الأمن. رحلة سعيدة!",
        options: [
          { id: 1, text: "Thank you so much! Have a nice day.", textAr: "شكراً جزيلاً! يوماً سعيداً.", isCorrect: true, feedback: "Wonderful! You completed the airport check-in.", feedbackAr: "رائع! أكملت تسجيل الوصول بالمطار." }
        ]
      }
    ]
  },
  {
    title: "Shopping for Clothes",
    titleAr: "التسوق لشراء الملابس",
    description: "Practice shopping for clothes in a store",
    descriptionAr: "تدرب على شراء الملابس من المتجر",
    category: "Shopping",
    categoryAr: "تسوق",
    level: "BEGINNER",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Shop Assistant: Hello! Can I help you find anything today?",
        messageAr: "البائع: مرحباً! هل يمكنني مساعدتك في إيجاد شيء اليوم؟",
        options: [
          { id: 1, text: "Yes, I'm looking for a blue shirt.", textAr: "نعم، أبحث عن قميص أزرق.", isCorrect: true, feedback: "Great! Clear and polite.", feedbackAr: "ممتاز! واضح ومهذب." },
          { id: 2, text: "Blue shirt.", textAr: "قميص أزرق.", isCorrect: false, feedback: "Try 'I'm looking for a blue shirt'.", feedbackAr: "قل 'I'm looking for a blue shirt'." },
          { id: 3, text: "I need buy shirt.", textAr: "أريد شراء قميص.", isCorrect: false, feedback: "Use 'I'm looking for' instead.", feedbackAr: "استخدم 'I'm looking for' بدلاً من ذلك." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Shop Assistant: What size are you looking for?",
        messageAr: "البائع: ما هو المقاس الذي تبحث عنه؟",
        options: [
          { id: 1, text: "I need a medium, please.", textAr: "أحتاج مقاس وسط، من فضلك.", isCorrect: true, feedback: "Perfect response!", feedbackAr: "إجابة مثالية!" },
          { id: 2, text: "Medium.", textAr: "وسط.", isCorrect: false, feedback: "Add 'I need' and 'please'.", feedbackAr: "أضف 'I need' و 'please'." },
          { id: 3, text: "Size M.", textAr: "مقاس M.", isCorrect: false, feedback: "Make it a full sentence.", feedbackAr: "اجعلها جملة كاملة." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Shop Assistant: Here you go. Would you like to try it on? The fitting room is over there.",
        messageAr: "البائع: تفضل. هل تريد تجربته؟ غرفة القياس هناك.",
        options: [
          { id: 1, text: "Yes, I'd like to try it on. Thank you.", textAr: "نعم، أريد تجربته. شكراً.", isCorrect: true, feedback: "Excellent!", feedbackAr: "ممتاز!" },
          { id: 2, text: "Yes.", textAr: "نعم.", isCorrect: false, feedback: "Be more complete in your response.", feedbackAr: "كن أكثر اكتمالاً في إجابتك." },
          { id: 3, text: "I try.", textAr: "سأجرب.", isCorrect: false, feedback: "Say 'I'd like to try it on'.", feedbackAr: "قل 'I'd like to try it on'." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Shop Assistant: How does it fit?",
        messageAr: "البائع: كيف المقاس؟",
        options: [
          { id: 1, text: "It fits perfectly. I'll take it.", textAr: "المقاس مثالي. سآخذه.", isCorrect: true, feedback: "Great way to express satisfaction!", feedbackAr: "طريقة رائعة للتعبير عن الرضا!" },
          { id: 2, text: "Good. Take.", textAr: "جيد. خذ.", isCorrect: false, feedback: "Try 'It fits perfectly. I'll take it.'", feedbackAr: "قل 'It fits perfectly. I'll take it.'" },
          { id: 3, text: "I buy.", textAr: "سأشتري.", isCorrect: false, feedback: "Use 'I'll take it' to sound natural.", feedbackAr: "استخدم 'I'll take it' لتبدو طبيعياً." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Shop Assistant: That will be $35. Would you like a bag?",
        messageAr: "البائع: المجموع 35 دولار. هل تريد كيساً؟",
        options: [
          { id: 1, text: "Yes, please. Here's my card.", textAr: "نعم، من فضلك. تفضل بطاقتي.", isCorrect: true, feedback: "Wonderful! Shopping complete!", feedbackAr: "رائع! أكملت التسوق!" }
        ]
      }
    ]
  },
  {
    title: "At the Doctor's Office",
    titleAr: "في عيادة الطبيب",
    description: "Practice describing symptoms and understanding medical advice",
    descriptionAr: "تدرب على وصف الأعراض وفهم النصائح الطبية",
    category: "Health",
    categoryAr: "صحة",
    level: "INTERMEDIATE",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Doctor: Good morning! What seems to be the problem?",
        messageAr: "الطبيب: صباح الخير! ما المشكلة؟",
        options: [
          { id: 1, text: "I've been having a headache for the past two days.", textAr: "أعاني من صداع منذ يومين.", isCorrect: true, feedback: "Good description of your symptoms!", feedbackAr: "وصف جيد للأعراض!" },
          { id: 2, text: "Head hurt.", textAr: "رأس يؤلم.", isCorrect: false, feedback: "Be more specific: 'I've been having a headache'.", feedbackAr: "كن أكثر تحديداً: 'I've been having a headache'." },
          { id: 3, text: "Pain.", textAr: "ألم.", isCorrect: false, feedback: "Describe where and for how long.", feedbackAr: "صف أين ومنذ متى." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Doctor: I see. Do you have any other symptoms like fever or nausea?",
        messageAr: "الطبيب: فهمت. هل لديك أعراض أخرى مثل الحمى أو الغثيان؟",
        options: [
          { id: 1, text: "Yes, I also have a slight fever and I feel tired.", textAr: "نعم، لدي حمى خفيفة وأشعر بالتعب.", isCorrect: true, feedback: "Excellent! Complete information helps the doctor.", feedbackAr: "ممتاز! المعلومات الكاملة تساعد الطبيب." },
          { id: 2, text: "Yes, fever.", textAr: "نعم، حمى.", isCorrect: false, feedback: "Give more details about all symptoms.", feedbackAr: "أعطِ المزيد من التفاصيل عن كل الأعراض." },
          { id: 3, text: "A little.", textAr: "قليلاً.", isCorrect: false, feedback: "Specify what symptoms you have.", feedbackAr: "حدد ما هي الأعراض التي لديك." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Doctor: Let me check your temperature. It's a mild flu. I'll prescribe some medicine.",
        messageAr: "الطبيب: دعني أفحص حرارتك. إنها إنفلونزا خفيفة. سأكتب لك بعض الأدوية.",
        options: [
          { id: 1, text: "How often should I take the medicine?", textAr: "كم مرة يجب أن آخذ الدواء؟", isCorrect: true, feedback: "Good question to ask!", feedbackAr: "سؤال جيد!" },
          { id: 2, text: "Medicine?", textAr: "الدواء؟", isCorrect: false, feedback: "Ask a complete question about dosage.", feedbackAr: "اسأل سؤالاً كاملاً عن الجرعة." },
          { id: 3, text: "OK.", textAr: "حسناً.", isCorrect: false, feedback: "It's good to ask about the dosage.", feedbackAr: "من الجيد السؤال عن الجرعة." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Doctor: Take one tablet three times a day after meals. Get plenty of rest and drink lots of water.",
        messageAr: "الطبيب: تناول قرصاً واحداً ثلاث مرات يومياً بعد الوجبات. احصل على راحة كافية واشرب الكثير من الماء.",
        options: [
          { id: 1, text: "Thank you, doctor. Should I come back if I don't feel better?", textAr: "شكراً دكتور. هل يجب أن أعود إذا لم أتحسن؟", isCorrect: true, feedback: "Smart question!", feedbackAr: "سؤال ذكي!" },
          { id: 2, text: "Thanks.", textAr: "شكراً.", isCorrect: false, feedback: "Ask about follow-up if needed.", feedbackAr: "اسأل عن المتابعة إذا لزم الأمر." },
          { id: 3, text: "OK bye.", textAr: "حسناً وداعاً.", isCorrect: false, feedback: "Ask about what to do if symptoms persist.", feedbackAr: "اسأل ماذا تفعل إذا استمرت الأعراض." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Doctor: Yes, if you don't improve within three days, please come back. Take care!",
        messageAr: "الطبيب: نعم، إذا لم تتحسن خلال ثلاثة أيام، يرجى العودة. اعتنِ بنفسك!",
        options: [
          { id: 1, text: "I will. Thank you for your help, doctor. Goodbye!", textAr: "سأفعل. شكراً لمساعدتك دكتور. مع السلامة!", isCorrect: true, feedback: "Great job! You completed the doctor visit.", feedbackAr: "أحسنت! أكملت زيارة الطبيب." }
        ]
      }
    ]
  },
  {
    title: "Job Interview",
    titleAr: "مقابلة عمل",
    description: "Practice common job interview questions and answers",
    descriptionAr: "تدرب على الأسئلة والأجوبة الشائعة في مقابلات العمل",
    category: "Work",
    categoryAr: "عمل",
    level: "ADVANCED",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Interviewer: Good morning! Please have a seat. Tell me about yourself.",
        messageAr: "المقابِل: صباح الخير! تفضل بالجلوس. أخبرني عن نفسك.",
        options: [
          { id: 1, text: "Thank you. I'm a marketing graduate with two years of experience in digital marketing.", textAr: "شكراً. أنا خريج تسويق مع خبرة عامين في التسويق الرقمي.", isCorrect: true, feedback: "Great professional introduction!", feedbackAr: "مقدمة مهنية رائعة!" },
          { id: 2, text: "I'm Ahmed, I'm 25.", textAr: "أنا أحمد، عمري 25.", isCorrect: false, feedback: "Focus on your professional background.", feedbackAr: "ركز على خلفيتك المهنية." },
          { id: 3, text: "I need job.", textAr: "أحتاج عمل.", isCorrect: false, feedback: "Start with your qualifications.", feedbackAr: "ابدأ بمؤهلاتك." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Interviewer: Why are you interested in this position?",
        messageAr: "المقابِل: لماذا أنت مهتم بهذه الوظيفة؟",
        options: [
          { id: 1, text: "I'm excited about this role because it aligns with my skills and your company's innovative approach.", textAr: "أنا متحمس لهذا الدور لأنه يتوافق مع مهاراتي ونهج شركتكم المبتكر.", isCorrect: true, feedback: "Excellent answer showing enthusiasm!", feedbackAr: "إجابة ممتازة تظهر الحماس!" },
          { id: 2, text: "Good salary.", textAr: "راتب جيد.", isCorrect: false, feedback: "Focus on the role and company, not just salary.", feedbackAr: "ركز على الدور والشركة، ليس الراتب فقط." },
          { id: 3, text: "I need money.", textAr: "أحتاج المال.", isCorrect: false, feedback: "Show interest in the position itself.", feedbackAr: "أظهر اهتماماً بالوظيفة نفسها." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Interviewer: What is your greatest strength?",
        messageAr: "المقابِل: ما هي أعظم نقاط قوتك؟",
        options: [
          { id: 1, text: "I'm highly organized and can manage multiple projects while meeting deadlines.", textAr: "أنا منظم للغاية ويمكنني إدارة عدة مشاريع مع الالتزام بالمواعيد.", isCorrect: true, feedback: "Good specific strength with example!", feedbackAr: "نقطة قوة محددة جيدة مع مثال!" },
          { id: 2, text: "I work hard.", textAr: "أعمل بجد.", isCorrect: false, feedback: "Be more specific about your strengths.", feedbackAr: "كن أكثر تحديداً عن نقاط قوتك." },
          { id: 3, text: "Everything.", textAr: "كل شيء.", isCorrect: false, feedback: "Give a specific, believable strength.", feedbackAr: "أعطِ نقطة قوة محددة وقابلة للتصديق." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Interviewer: Do you have any questions for us?",
        messageAr: "المقابِل: هل لديك أي أسئلة لنا؟",
        options: [
          { id: 1, text: "Yes, could you tell me more about the team I would be working with?", textAr: "نعم، هل يمكنك إخباري المزيد عن الفريق الذي سأعمل معه؟", isCorrect: true, feedback: "Great question showing interest!", feedbackAr: "سؤال رائع يظهر الاهتمام!" },
          { id: 2, text: "How much vacation?", textAr: "كم الإجازة؟", isCorrect: false, feedback: "Ask about the role first.", feedbackAr: "اسأل عن الدور أولاً." },
          { id: 3, text: "No.", textAr: "لا.", isCorrect: false, feedback: "Always have questions prepared.", feedbackAr: "جهز أسئلة دائماً." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Interviewer: Thank you for coming. We'll be in touch within a week.",
        messageAr: "المقابِل: شكراً لحضورك. سنتواصل معك خلال أسبوع.",
        options: [
          { id: 1, text: "Thank you for the opportunity. I look forward to hearing from you.", textAr: "شكراً على الفرصة. أتطلع للسماع منكم.", isCorrect: true, feedback: "Professional closing! Interview completed.", feedbackAr: "ختام مهني! أكملت المقابلة." }
        ]
      }
    ]
  },
  {
    title: "Making a Phone Call",
    titleAr: "إجراء مكالمة هاتفية",
    description: "Practice making and receiving phone calls",
    descriptionAr: "تدرب على إجراء واستقبال المكالمات الهاتفية",
    category: "Communication",
    categoryAr: "تواصل",
    level: "BEGINNER",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Receptionist: Good afternoon, ABC Company. How may I help you?",
        messageAr: "موظفة الاستقبال: مساء الخير، شركة ABC. كيف يمكنني مساعدتك؟",
        options: [
          { id: 1, text: "Hello, I'd like to speak with Mr. Smith, please.", textAr: "مرحباً، أريد التحدث مع السيد سميث، من فضلك.", isCorrect: true, feedback: "Perfect polite request!", feedbackAr: "طلب مهذب مثالي!" },
          { id: 2, text: "Give me Smith.", textAr: "أعطني سميث.", isCorrect: false, feedback: "Be more polite: 'I'd like to speak with...'", feedbackAr: "كن أكثر تهذيباً: 'I'd like to speak with...'" },
          { id: 3, text: "Smith.", textAr: "سميث.", isCorrect: false, feedback: "Make a complete polite request.", feedbackAr: "اطلب طلباً كاملاً مهذباً." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Receptionist: May I ask who's calling?",
        messageAr: "موظفة الاستقبال: هل يمكنني معرفة من المتصل؟",
        options: [
          { id: 1, text: "This is John Brown from XYZ Company.", textAr: "أنا جون براون من شركة XYZ.", isCorrect: true, feedback: "Great professional identification!", feedbackAr: "تعريف مهني رائع!" },
          { id: 2, text: "John.", textAr: "جون.", isCorrect: false, feedback: "Give your full name and company.", feedbackAr: "أعطِ اسمك الكامل وشركتك." },
          { id: 3, text: "Me.", textAr: "أنا.", isCorrect: false, feedback: "Identify yourself properly.", feedbackAr: "عرّف نفسك بشكل صحيح." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Receptionist: One moment please, I'll transfer your call. ...I'm sorry, Mr. Smith is in a meeting. Would you like to leave a message?",
        messageAr: "موظفة الاستقبال: لحظة من فضلك، سأحول مكالمتك. ...آسفة، السيد سميث في اجتماع. هل تريد ترك رسالة؟",
        options: [
          { id: 1, text: "Yes, please. Could you ask him to call me back? My number is 555-1234.", textAr: "نعم، من فضلك. هل يمكنك أن تطلبي منه الاتصال بي؟ رقمي 555-1234.", isCorrect: true, feedback: "Perfect message leaving!", feedbackAr: "ترك رسالة مثالي!" },
          { id: 2, text: "Call me.", textAr: "اتصلي بي.", isCorrect: false, feedback: "Give your number and a polite request.", feedbackAr: "أعطِ رقمك وطلباً مهذباً." },
          { id: 3, text: "OK bye.", textAr: "حسناً وداعاً.", isCorrect: false, feedback: "Leave a message for a callback.", feedbackAr: "اترك رسالة لإعادة الاتصال." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Receptionist: Certainly. I'll make sure he gets your message. Is there anything else?",
        messageAr: "موظفة الاستقبال: بالتأكيد. سأتأكد من وصول رسالتك. هل هناك شيء آخر؟",
        options: [
          { id: 1, text: "No, that's all. Thank you for your help.", textAr: "لا، هذا كل شيء. شكراً لمساعدتك.", isCorrect: true, feedback: "Polite closing!", feedbackAr: "ختام مهذب!" },
          { id: 2, text: "No.", textAr: "لا.", isCorrect: false, feedback: "Add 'thank you' for politeness.", feedbackAr: "أضف 'thank you' للتهذيب." },
          { id: 3, text: "Bye.", textAr: "وداعاً.", isCorrect: false, feedback: "Thank them for their help.", feedbackAr: "اشكرهم على مساعدتهم." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Receptionist: You're welcome. Have a nice day!",
        messageAr: "موظفة الاستقبال: عفواً. يوماً سعيداً!",
        options: [
          { id: 1, text: "You too. Goodbye!", textAr: "وأنتِ أيضاً. مع السلامة!", isCorrect: true, feedback: "Great! Phone call completed successfully.", feedbackAr: "رائع! أكملت المكالمة الهاتفية بنجاح." }
        ]
      }
    ]
  },
  {
    title: "Hotel Check-in",
    titleAr: "تسجيل الوصول في الفندق",
    description: "Practice checking into a hotel and making requests",
    descriptionAr: "تدرب على تسجيل الوصول في الفندق وتقديم الطلبات",
    category: "Travel",
    categoryAr: "سفر",
    level: "INTERMEDIATE",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "Receptionist: Good evening and welcome to the Grand Hotel! Do you have a reservation?",
        messageAr: "موظف الاستقبال: مساء الخير وأهلاً بك في فندق جراند! هل لديك حجز؟",
        options: [
          { id: 1, text: "Yes, I have a reservation under the name Ahmed Hassan.", textAr: "نعم، لدي حجز باسم أحمد حسن.", isCorrect: true, feedback: "Perfect! Clear identification of your booking.", feedbackAr: "ممتاز! تعريف واضح بحجزك." },
          { id: 2, text: "Yes, Ahmed.", textAr: "نعم، أحمد.", isCorrect: false, feedback: "Provide your full name for the reservation.", feedbackAr: "أعطِ اسمك الكامل للحجز." },
          { id: 3, text: "Room.", textAr: "غرفة.", isCorrect: false, feedback: "Confirm your reservation with your full name.", feedbackAr: "أكد حجزك باسمك الكامل." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Receptionist: Yes, I found your reservation. You have a deluxe room for three nights. May I see your passport or ID, please?",
        messageAr: "موظف الاستقبال: نعم، وجدت حجزك. لديك غرفة فاخرة لثلاث ليالٍ. هل يمكنني رؤية جواز سفرك أو هويتك؟",
        options: [
          { id: 1, text: "Of course, here's my passport.", textAr: "بالتأكيد، تفضل جواز سفري.", isCorrect: true, feedback: "Great cooperative response!", feedbackAr: "رد تعاوني رائع!" },
          { id: 2, text: "Here.", textAr: "تفضل.", isCorrect: false, feedback: "Be more complete: 'Here's my passport'.", feedbackAr: "كن أكثر اكتمالاً: 'Here's my passport'." },
          { id: 3, text: "Why?", textAr: "لماذا؟", isCorrect: false, feedback: "This is standard procedure. Just hand it over politely.", feedbackAr: "هذا إجراء عادي. قدمه بلطف." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Receptionist: Thank you. Your room is on the 5th floor, room 512. Would you like a wake-up call?",
        messageAr: "موظف الاستقبال: شكراً. غرفتك في الطابق الخامس، رقم 512. هل تريد مكالمة إيقاظ؟",
        options: [
          { id: 1, text: "Yes, please. Could you call me at 7 AM?", textAr: "نعم، من فضلك. هل يمكنك الاتصال بي الساعة 7 صباحاً؟", isCorrect: true, feedback: "Clear and polite request!", feedbackAr: "طلب واضح ومهذب!" },
          { id: 2, text: "7 AM.", textAr: "7 صباحاً.", isCorrect: false, feedback: "Make it a complete request.", feedbackAr: "اجعله طلباً كاملاً." },
          { id: 3, text: "Maybe.", textAr: "ربما.", isCorrect: false, feedback: "Give a clear answer yes or no.", feedbackAr: "أعطِ إجابة واضحة نعم أو لا." }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Receptionist: No problem. Is there anything else I can help you with?",
        messageAr: "موظف الاستقبال: لا مشكلة. هل هناك شيء آخر يمكنني مساعدتك به؟",
        options: [
          { id: 1, text: "Yes, what time does breakfast start?", textAr: "نعم، متى يبدأ الإفطار؟", isCorrect: true, feedback: "Good practical question!", feedbackAr: "سؤال عملي جيد!" },
          { id: 2, text: "Breakfast?", textAr: "إفطار؟", isCorrect: false, feedback: "Ask a complete question about breakfast.", feedbackAr: "اسأل سؤالاً كاملاً عن الإفطار." },
          { id: 3, text: "Food.", textAr: "طعام.", isCorrect: false, feedback: "Be more specific with your question.", feedbackAr: "كن أكثر تحديداً في سؤالك." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Receptionist: Breakfast is served from 7 to 10 AM in the restaurant on the ground floor. Here's your key card. Enjoy your stay!",
        messageAr: "موظف الاستقبال: الإفطار يُقدم من 7 إلى 10 صباحاً في المطعم بالطابق الأرضي. تفضل بطاقة المفتاح. استمتع بإقامتك!",
        options: [
          { id: 1, text: "Thank you so much for your help. Have a good evening!", textAr: "شكراً جزيلاً على مساعدتك. مساء سعيد!", isCorrect: true, feedback: "Excellent! Hotel check-in completed!", feedbackAr: "ممتاز! أكملت تسجيل الوصول في الفندق!" }
        ]
      }
    ]
  },
  {
    title: "Asking for Help",
    titleAr: "طلب المساعدة",
    description: "Practice asking for assistance in various situations",
    descriptionAr: "تدرب على طلب المساعدة في مواقف مختلفة",
    category: "Daily Life",
    categoryAr: "حياة يومية",
    level: "BEGINNER",
    dialogueSteps: [
      {
        id: 1,
        speaker: "system",
        message: "You're in a store and can't find what you're looking for. You see a store employee.",
        messageAr: "أنت في متجر ولا تجد ما تبحث عنه. ترى موظفاً في المتجر.",
        options: [
          { id: 1, text: "Excuse me, could you help me find the electronics section?", textAr: "عفواً، هل يمكنك مساعدتي في إيجاد قسم الإلكترونيات؟", isCorrect: true, feedback: "Perfect polite request for help!", feedbackAr: "طلب مساعدة مهذب ومثالي!" },
          { id: 2, text: "Electronics where?", textAr: "الإلكترونيات أين؟", isCorrect: false, feedback: "Start with 'Excuse me' and ask politely.", feedbackAr: "ابدأ بـ 'Excuse me' واسأل بلطف." },
          { id: 3, text: "Hey! Where's electronics?", textAr: "هيي! أين الإلكترونيات؟", isCorrect: false, feedback: "Use 'Excuse me' for a politer approach.", feedbackAr: "استخدم 'Excuse me' لتكون أكثر تهذيباً." }
        ],
        nextStep: 2
      },
      {
        id: 2,
        speaker: "system",
        message: "Employee: Of course! Go to aisle 5 and turn left. Is there anything specific you're looking for?",
        messageAr: "الموظف: بالتأكيد! اذهب إلى الممر 5 واتجه يساراً. هل تبحث عن شيء محدد؟",
        options: [
          { id: 1, text: "Yes, I'm looking for wireless headphones.", textAr: "نعم، أبحث عن سماعات لاسلكية.", isCorrect: true, feedback: "Clear and specific!", feedbackAr: "واضح ومحدد!" },
          { id: 2, text: "Headphones.", textAr: "سماعات.", isCorrect: false, feedback: "Give more details: 'I'm looking for...'", feedbackAr: "أعطِ المزيد من التفاصيل: 'I'm looking for...'" },
          { id: 3, text: "Yes.", textAr: "نعم.", isCorrect: false, feedback: "Be specific about what you need.", feedbackAr: "كن محدداً فيما تحتاج." }
        ],
        nextStep: 3
      },
      {
        id: 3,
        speaker: "system",
        message: "Employee: We have several options. What's your budget?",
        messageAr: "الموظف: لدينا عدة خيارات. ما هي ميزانيتك؟",
        options: [
          { id: 1, text: "I'm looking to spend around 50 dollars.", textAr: "أتطلع لإنفاق حوالي 50 دولاراً.", isCorrect: true, feedback: "Good clear answer about budget!", feedbackAr: "إجابة واضحة جيدة عن الميزانية!" },
          { id: 2, text: "Cheap.", textAr: "رخيص.", isCorrect: false, feedback: "Give a specific budget range.", feedbackAr: "أعطِ نطاق ميزانية محدد." },
          { id: 3, text: "Not expensive.", textAr: "ليس غالياً.", isCorrect: false, feedback: "Be more specific: 'around 50 dollars'", feedbackAr: "كن أكثر تحديداً: 'حوالي 50 دولاراً'" }
        ],
        nextStep: 4
      },
      {
        id: 4,
        speaker: "system",
        message: "Employee: I recommend these. They're $45 and have great reviews. Would you like to try them?",
        messageAr: "الموظف: أنصحك بهذه. سعرها 45 دولاراً ولها تقييمات رائعة. هل تريد تجربتها؟",
        options: [
          { id: 1, text: "Yes, that would be great. Thank you for your help!", textAr: "نعم، سيكون ذلك رائعاً. شكراً لمساعدتك!", isCorrect: true, feedback: "Perfect response with gratitude!", feedbackAr: "رد مثالي مع الامتنان!" },
          { id: 2, text: "OK.", textAr: "حسناً.", isCorrect: false, feedback: "Show appreciation: 'Thank you for your help'", feedbackAr: "أظهر التقدير: 'Thank you for your help'" },
          { id: 3, text: "Give me.", textAr: "أعطني.", isCorrect: false, feedback: "Say 'Yes, please' and thank them.", feedbackAr: "قل 'Yes, please' واشكرهم." }
        ],
        nextStep: 5
      },
      {
        id: 5,
        speaker: "system",
        message: "Employee: You're welcome! Let me know if you need anything else.",
        messageAr: "الموظف: عفواً! أخبرني إذا احتجت أي شيء آخر.",
        options: [
          { id: 1, text: "I will. Thanks again for all your help!", textAr: "سأفعل. شكراً مرة أخرى على كل مساعدتك!", isCorrect: true, feedback: "Excellent! You completed the conversation!", feedbackAr: "ممتاز! أكملت المحادثة!" }
        ]
      }
    ]
  }
]

export const textConversationQuestions = [
  {
    title: "Daily Routine",
    titleAr: "الروتين اليومي",
    description: "Practice talking about your daily activities",
    descriptionAr: "تدرب على الحديث عن أنشطتك اليومية",
    level: "BEGINNER",
    questions: [
      {
        id: 1,
        question: "What time do you usually wake up?",
        questionAr: "في أي وقت تستيقظ عادةً؟",
        keywords: ["wake", "morning", "o'clock", "am", "early", "late", "around"],
        sampleAnswer: "I usually wake up at 7 o'clock in the morning.",
        sampleAnswerAr: "أستيقظ عادةً في الساعة السابعة صباحاً."
      },
      {
        id: 2,
        question: "What do you have for breakfast?",
        questionAr: "ماذا تتناول في الإفطار؟",
        keywords: ["eat", "have", "breakfast", "eggs", "bread", "coffee", "tea", "juice", "cereal", "fruit"],
        sampleAnswer: "I usually have eggs and toast with coffee for breakfast.",
        sampleAnswerAr: "عادةً أتناول البيض والخبز المحمص مع القهوة في الإفطار."
      },
      {
        id: 3,
        question: "How do you go to work or school?",
        questionAr: "كيف تذهب إلى العمل أو المدرسة؟",
        keywords: ["go", "walk", "drive", "bus", "car", "metro", "train", "bike", "take", "ride"],
        sampleAnswer: "I take the bus to go to work.",
        sampleAnswerAr: "أستقل الحافلة للذهاب إلى العمل."
      },
      {
        id: 4,
        question: "What do you like to do in your free time?",
        questionAr: "ماذا تحب أن تفعل في وقت فراغك؟",
        keywords: ["like", "enjoy", "read", "watch", "play", "sports", "games", "music", "friends", "movies"],
        sampleAnswer: "I like to read books and watch movies in my free time.",
        sampleAnswerAr: "أحب قراءة الكتب ومشاهدة الأفلام في وقت فراغي."
      }
    ]
  },
  {
    title: "About Yourself",
    titleAr: "عن نفسك",
    description: "Practice introducing yourself and talking about your interests",
    descriptionAr: "تدرب على تقديم نفسك والحديث عن اهتماماتك",
    level: "BEGINNER",
    questions: [
      {
        id: 1,
        question: "What is your name and where are you from?",
        questionAr: "ما اسمك ومن أين أنت؟",
        keywords: ["name", "from", "live", "city", "country", "born"],
        sampleAnswer: "My name is Ahmed and I'm from Cairo, Egypt.",
        sampleAnswerAr: "اسمي أحمد وأنا من القاهرة، مصر."
      },
      {
        id: 2,
        question: "What do you do? (Your job or studies)",
        questionAr: "ماذا تعمل؟ (عملك أو دراستك)",
        keywords: ["work", "study", "student", "job", "company", "university", "school", "teacher", "engineer", "doctor"],
        sampleAnswer: "I'm a student at Cairo University, studying engineering.",
        sampleAnswerAr: "أنا طالب في جامعة القاهرة، أدرس الهندسة."
      },
      {
        id: 3,
        question: "What are your hobbies?",
        questionAr: "ما هي هواياتك؟",
        keywords: ["hobby", "like", "enjoy", "love", "reading", "sports", "music", "cooking", "traveling", "swimming"],
        sampleAnswer: "My hobbies are reading, swimming, and listening to music.",
        sampleAnswerAr: "هواياتي هي القراءة والسباحة والاستماع للموسيقى."
      }
    ]
  },
  {
    title: "Travel and Vacation",
    titleAr: "السفر والإجازة",
    description: "Practice talking about travel experiences",
    descriptionAr: "تدرب على الحديث عن تجارب السفر",
    level: "INTERMEDIATE",
    questions: [
      {
        id: 1,
        question: "Where did you go on your last vacation?",
        questionAr: "أين ذهبت في إجازتك الأخيرة؟",
        keywords: ["went", "visited", "traveled", "trip", "vacation", "holiday", "beach", "city", "country"],
        sampleAnswer: "I went to Dubai last summer for a family vacation.",
        sampleAnswerAr: "ذهبت إلى دبي الصيف الماضي في إجازة عائلية."
      },
      {
        id: 2,
        question: "What places would you like to visit in the future?",
        questionAr: "ما الأماكن التي تريد زيارتها في المستقبل؟",
        keywords: ["want", "would", "like", "visit", "dream", "hope", "travel", "see", "explore"],
        sampleAnswer: "I would like to visit Paris and London someday.",
        sampleAnswerAr: "أريد زيارة باريس ولندن يوماً ما."
      },
      {
        id: 3,
        question: "What do you usually pack for a trip?",
        questionAr: "ماذا تحزم عادةً للسفر؟",
        keywords: ["pack", "clothes", "passport", "suitcase", "camera", "phone", "charger", "toiletries", "bring"],
        sampleAnswer: "I usually pack clothes, my passport, camera, and toiletries.",
        sampleAnswerAr: "عادةً أحزم الملابس وجواز السفر والكاميرا ومستلزمات النظافة."
      }
    ]
  },
  {
    title: "Food and Cooking",
    titleAr: "الطعام والطبخ",
    description: "Practice talking about food preferences and cooking",
    descriptionAr: "تدرب على الحديث عن تفضيلات الطعام والطبخ",
    level: "INTERMEDIATE",
    questions: [
      {
        id: 1,
        question: "What is your favorite food?",
        questionAr: "ما هو طعامك المفضل؟",
        keywords: ["favorite", "like", "love", "prefer", "food", "dish", "meal", "cuisine"],
        sampleAnswer: "My favorite food is grilled chicken with rice and vegetables.",
        sampleAnswerAr: "طعامي المفضل هو الدجاج المشوي مع الأرز والخضروات."
      },
      {
        id: 2,
        question: "Can you cook? What dishes can you make?",
        questionAr: "هل تستطيع الطبخ؟ ما الأطباق التي يمكنك عملها؟",
        keywords: ["cook", "make", "prepare", "recipe", "dish", "pasta", "rice", "soup", "salad", "meat"],
        sampleAnswer: "Yes, I can cook. I can make pasta, fried rice, and grilled fish.",
        sampleAnswerAr: "نعم، أستطيع الطبخ. يمكنني عمل المكرونة والأرز المقلي والسمك المشوي."
      },
      {
        id: 3,
        question: "Do you prefer eating at home or at restaurants?",
        questionAr: "هل تفضل الأكل في المنزل أم في المطاعم؟",
        keywords: ["prefer", "home", "restaurant", "eat", "cook", "healthy", "cheaper", "convenient", "taste"],
        sampleAnswer: "I prefer eating at home because it's healthier and cheaper.",
        sampleAnswerAr: "أفضل الأكل في المنزل لأنه أصح وأرخص."
      }
    ]
  }
]

export interface VoicePromptItem {
  text: string
  textAr: string
  pronunciationTip?: string
  pronunciationTipAr?: string
  phonetics?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface VoicePromptCategory {
  category: string
  categoryAr: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  prompts: VoicePromptItem[]
}

export const voicePrompts: VoicePromptCategory[] = [
  {
    category: "Greetings",
    categoryAr: "التحيات",
    level: "BEGINNER",
    prompts: [
      { 
        text: "Hello, how are you today?", 
        textAr: "مرحباً، كيف حالك اليوم؟",
        pronunciationTip: "Stress the word 'you' slightly and let your voice rise at the end for the question.",
        pronunciationTipAr: "شدد على كلمة 'you' قليلاً وارفع صوتك في النهاية للسؤال.",
        phonetics: "/həˈloʊ haʊ ɑːr juː təˈdeɪ/",
        difficulty: 'easy'
      },
      { 
        text: "Good morning! Nice to meet you.", 
        textAr: "صباح الخير! سعيد بلقائك.",
        pronunciationTip: "Sound enthusiastic! Emphasize 'Nice' and smile while speaking.",
        pronunciationTipAr: "كن متحمساً! شدد على 'Nice' وابتسم أثناء الحديث.",
        phonetics: "/ɡʊd ˈmɔːrnɪŋ naɪs tuː miːt juː/",
        difficulty: 'easy'
      },
      { 
        text: "Good evening! How was your day?", 
        textAr: "مساء الخير! كيف كان يومك؟",
        pronunciationTip: "The 'v' in 'evening' should be voiced, not like 'f'. Practice: 'eev-ning'.",
        pronunciationTipAr: "حرف 'v' في 'evening' يجب أن يكون مجهوراً، ليس مثل 'f'. تدرب: 'eev-ning'.",
        phonetics: "/ɡʊd ˈiːvnɪŋ haʊ wɒz jɔːr deɪ/",
        difficulty: 'easy'
      },
      { 
        text: "Hi! My name is... What's your name?", 
        textAr: "مرحباً! اسمي... ما اسمك؟",
        pronunciationTip: "Contract 'What is' to 'What's' naturally. The 'ts' sound should be quick.",
        pronunciationTipAr: "اختصر 'What is' إلى 'What's' بشكل طبيعي. صوت 'ts' يجب أن يكون سريعاً.",
        phonetics: "/haɪ maɪ neɪm ɪz... wɒts jɔːr neɪm/",
        difficulty: 'easy'
      }
    ]
  },
  {
    category: "Restaurant",
    categoryAr: "مطعم",
    level: "BEGINNER",
    prompts: [
      { 
        text: "I would like a table for two, please.", 
        textAr: "أريد طاولة لشخصين، من فضلك.",
        pronunciationTip: "Say 'would like' smoothly as one unit: 'wud-like'. Don't pause between words.",
        pronunciationTipAr: "قل 'would like' بسلاسة كوحدة واحدة: 'wud-like'. لا تتوقف بين الكلمات.",
        phonetics: "/aɪ wʊd laɪk ə ˈteɪbl fɔːr tuː pliːz/",
        difficulty: 'easy'
      },
      { 
        text: "Can I see the menu, please?", 
        textAr: "هل يمكنني رؤية القائمة، من فضلك؟",
        pronunciationTip: "The word 'menu' is pronounced 'MEN-yoo', not 'me-noo'. Stress the first syllable.",
        pronunciationTipAr: "كلمة 'menu' تُنطق 'MEN-yoo'، ليس 'me-noo'. شدد على المقطع الأول.",
        phonetics: "/kæn aɪ siː ðə ˈmenjuː pliːz/",
        difficulty: 'easy'
      },
      { 
        text: "I'll have the grilled chicken with rice.", 
        textAr: "سآخذ الدجاج المشوي مع الأرز.",
        pronunciationTip: "'Grilled' has a silent 'e'. Say 'grild' not 'gril-led'. The 'ch' in chicken is soft.",
        pronunciationTipAr: "'Grilled' فيها 'e' صامتة. قل 'grild' ليس 'gril-led'. حرف 'ch' في chicken ناعم.",
        phonetics: "/aɪl hæv ðə ɡrɪld ˈtʃɪkɪn wɪð raɪs/",
        difficulty: 'medium'
      },
      { 
        text: "Could I have the bill, please?", 
        textAr: "هل يمكنني الحصول على الفاتورة، من فضلك؟",
        pronunciationTip: "'Could' sounds like 'kud', the 'l' is silent. This is more polite than 'Can I'.",
        pronunciationTipAr: "'Could' تُنطق مثل 'kud'، حرف 'l' صامت. هذا أكثر تهذيباً من 'Can I'.",
        phonetics: "/kʊd aɪ hæv ðə bɪl pliːz/",
        difficulty: 'easy'
      }
    ]
  },
  {
    category: "Shopping",
    categoryAr: "التسوق",
    level: "BEGINNER",
    prompts: [
      { 
        text: "How much does this cost?", 
        textAr: "كم سعر هذا؟",
        pronunciationTip: "Link 'does this' together: 'duz-this'. Natural speakers connect these words.",
        pronunciationTipAr: "اربط 'does this' معاً: 'duz-this'. المتحدثون الطبيعيون يربطون هذه الكلمات.",
        phonetics: "/haʊ mʌtʃ dʌz ðɪs kɒst/",
        difficulty: 'easy'
      },
      { 
        text: "Do you have this in a larger size?", 
        textAr: "هل لديكم هذا بمقاس أكبر؟",
        pronunciationTip: "'Larger' has a soft 'g' like 'j': 'lar-jer'. Practice the 'r' sound clearly.",
        pronunciationTipAr: "'Larger' فيها 'g' ناعمة مثل 'j': 'lar-jer'. تدرب على صوت 'r' بوضوح.",
        phonetics: "/duː juː hæv ðɪs ɪn ə ˈlɑːrdʒər saɪz/",
        difficulty: 'medium'
      },
      { 
        text: "I'm just looking, thank you.", 
        textAr: "أنا فقط أتفرج، شكراً.",
        pronunciationTip: "Say 'I'm' as one sound, not 'I am'. The 'th' in 'thank' needs your tongue between teeth.",
        pronunciationTipAr: "قل 'I'm' كصوت واحد، ليس 'I am'. حرف 'th' في 'thank' يحتاج لسانك بين أسنانك.",
        phonetics: "/aɪm dʒʌst ˈlʊkɪŋ θæŋk juː/",
        difficulty: 'easy'
      },
      { 
        text: "I'll take it. Where can I pay?", 
        textAr: "سآخذه. أين يمكنني الدفع؟",
        pronunciationTip: "'I'll' is contracted - say 'ile' quickly. 'Where' starts with a soft 'w' sound.",
        pronunciationTipAr: "'I'll' مختصرة - قل 'ile' بسرعة. 'Where' تبدأ بصوت 'w' ناعم.",
        phonetics: "/aɪl teɪk ɪt weər kæn aɪ peɪ/",
        difficulty: 'easy'
      }
    ]
  },
  {
    category: "Directions",
    categoryAr: "الاتجاهات",
    level: "INTERMEDIATE",
    prompts: [
      { 
        text: "Excuse me, where is the nearest metro station?", 
        textAr: "عفواً، أين أقرب محطة مترو؟",
        pronunciationTip: "'Excuse' is 'ik-SKYOOZ'. 'Nearest' has two syllables: 'NEER-ist'.",
        pronunciationTipAr: "'Excuse' تُنطق 'ik-SKYOOZ'. 'Nearest' لها مقطعين: 'NEER-ist'.",
        phonetics: "/ɪkˈskjuːz miː weər ɪz ðə ˈnɪərɪst ˈmetroʊ ˈsteɪʃn/",
        difficulty: 'medium'
      },
      { 
        text: "How do I get to the city center?", 
        textAr: "كيف أصل إلى وسط المدينة؟",
        pronunciationTip: "'City center' - both words have the 'i' sound but 'center' ends with 'ter' not 'tar'.",
        pronunciationTipAr: "'City center' - كلتا الكلمتين فيهما صوت 'i' لكن 'center' تنتهي بـ 'ter' ليس 'tar'.",
        phonetics: "/haʊ duː aɪ ɡet tuː ðə ˈsɪti ˈsentər/",
        difficulty: 'easy'
      },
      { 
        text: "Go straight and turn right at the traffic light.", 
        textAr: "امشِ مباشرة واتجه يميناً عند إشارة المرور.",
        pronunciationTip: "'Straight' - the 'gh' is silent. Say 'strayt'. 'Traffic' stress is on 'TRA-fic'.",
        pronunciationTipAr: "'Straight' - حرف 'gh' صامت. قل 'strayt'. التشديد في 'traffic' على 'TRA-fic'.",
        phonetics: "/ɡoʊ streɪt ænd tɜːrn raɪt æt ðə ˈtræfɪk laɪt/",
        difficulty: 'medium'
      },
      { 
        text: "Is it far from here? Can I walk?", 
        textAr: "هل هي بعيدة من هنا؟ هل يمكنني المشي؟",
        pronunciationTip: "'Far' and 'here' both have strong 'r' sounds. Make your voice rise for questions.",
        pronunciationTipAr: "'Far' و 'here' كلاهما فيهما صوت 'r' قوي. ارفع صوتك للأسئلة.",
        phonetics: "/ɪz ɪt fɑːr frɒm hɪər kæn aɪ wɔːk/",
        difficulty: 'easy'
      }
    ]
  },
  {
    category: "At Work",
    categoryAr: "في العمل",
    level: "INTERMEDIATE",
    prompts: [
      { 
        text: "Could you please send me the report by email?", 
        textAr: "هل يمكنك إرسال التقرير لي بالبريد الإلكتروني؟",
        pronunciationTip: "'Report' stress is on the second syllable: 're-PORT'. 'Email' is 'EE-mayl'.",
        pronunciationTipAr: "التشديد في 'report' على المقطع الثاني: 're-PORT'. 'Email' تُنطق 'EE-mayl'.",
        phonetics: "/kʊd juː pliːz send miː ðə rɪˈpɔːrt baɪ ˈiːmeɪl/",
        difficulty: 'medium'
      },
      { 
        text: "I have a meeting at 3 PM today.", 
        textAr: "لدي اجتماع الساعة 3 بعد الظهر اليوم.",
        pronunciationTip: "'Meeting' - double 'e' is a long 'ee' sound. 'At three' links together smoothly.",
        pronunciationTipAr: "'Meeting' - حرف 'e' المزدوج هو صوت 'ee' طويل. 'At three' تترابط معاً بسلاسة.",
        phonetics: "/aɪ hæv ə ˈmiːtɪŋ æt θriː piː em təˈdeɪ/",
        difficulty: 'easy'
      },
      { 
        text: "Let's schedule a call for tomorrow morning.", 
        textAr: "دعنا نحدد موعداً لمكالمة غداً صباحاً.",
        pronunciationTip: "'Schedule' - in American English: 'SKED-jool', British: 'SHED-yool'. 'Tomorrow' stress on 'mor'.",
        pronunciationTipAr: "'Schedule' - بالإنجليزية الأمريكية: 'SKED-jool'، البريطانية: 'SHED-yool'. التشديد في 'tomorrow' على 'mor'.",
        phonetics: "/lets ˈskedʒuːl ə kɔːl fɔːr təˈmɒroʊ ˈmɔːrnɪŋ/",
        difficulty: 'hard'
      },
      { 
        text: "I'll finish this project by Friday.", 
        textAr: "سأنهي هذا المشروع بحلول الجمعة.",
        pronunciationTip: "'Project' stress on first syllable: 'PRO-jekt'. 'Friday' is 'FRY-day'.",
        pronunciationTipAr: "التشديد في 'project' على المقطع الأول: 'PRO-jekt'. 'Friday' تُنطق 'FRY-day'.",
        phonetics: "/aɪl ˈfɪnɪʃ ðɪs ˈprɒdʒekt baɪ ˈfraɪdeɪ/",
        difficulty: 'medium'
      }
    ]
  },
  {
    category: "Travel",
    categoryAr: "السفر",
    level: "ADVANCED",
    prompts: [
      { 
        text: "I'd like to book a round-trip ticket to London, please.", 
        textAr: "أريد حجز تذكرة ذهاب وعودة إلى لندن، من فضلك.",
        pronunciationTip: "'I'd like' = 'I would like' contracted. 'Round-trip' - emphasize both parts equally.",
        pronunciationTipAr: "'I'd like' = 'I would like' مختصرة. 'Round-trip' - شدد على كلا الجزأين بالتساوي.",
        phonetics: "/aɪd laɪk tuː bʊk ə ˈraʊnd trɪp ˈtɪkɪt tuː ˈlʌndən pliːz/",
        difficulty: 'medium'
      },
      { 
        text: "What time does the flight depart?", 
        textAr: "في أي وقت تغادر الطائرة؟",
        pronunciationTip: "'Flight' - the 'gh' is silent. 'Depart' stress on second syllable: 'de-PART'.",
        pronunciationTipAr: "'Flight' - حرف 'gh' صامت. التشديد في 'depart' على المقطع الثاني: 'de-PART'.",
        phonetics: "/wɒt taɪm dʌz ðə flaɪt dɪˈpɑːrt/",
        difficulty: 'medium'
      },
      { 
        text: "Could you recommend a good hotel near the airport?", 
        textAr: "هل يمكنك اقتراح فندق جيد بالقرب من المطار؟",
        pronunciationTip: "'Recommend' stress on last syllable: 'rec-om-MEND'. 'Airport' is 'AIR-port'.",
        pronunciationTipAr: "التشديد في 'recommend' على المقطع الأخير: 'rec-om-MEND'. 'Airport' تُنطق 'AIR-port'.",
        phonetics: "/kʊd juː ˌrekəˈmend ə ɡʊd hoʊˈtel nɪər ðə ˈeərpɔːrt/",
        difficulty: 'hard'
      },
      { 
        text: "I need to cancel my reservation. What's the cancellation policy?", 
        textAr: "أحتاج إلغاء حجزي. ما هي سياسة الإلغاء؟",
        pronunciationTip: "'Cancellation' has 5 syllables: 'can-cel-LAY-shun'. Link 'What's the' smoothly.",
        pronunciationTipAr: "'Cancellation' لها 5 مقاطع: 'can-cel-LAY-shun'. اربط 'What's the' بسلاسة.",
        phonetics: "/aɪ niːd tuː ˈkænsəl maɪ ˌrezərˈveɪʃn wɒts ðə ˌkænsəˈleɪʃn ˈpɒləsi/",
        difficulty: 'hard'
      }
    ]
  },
  {
    category: "Emergency",
    categoryAr: "حالات الطوارئ",
    level: "INTERMEDIATE",
    prompts: [
      {
        text: "Help! I need a doctor!",
        textAr: "النجدة! أحتاج طبيباً!",
        pronunciationTip: "Speak loudly and clearly. 'Doctor' is 'DOK-ter', stress on first syllable.",
        pronunciationTipAr: "تحدث بصوت عالٍ وواضح. 'Doctor' تُنطق 'DOK-ter'، التشديد على المقطع الأول.",
        phonetics: "/help aɪ niːd ə ˈdɒktər/",
        difficulty: 'easy'
      },
      {
        text: "Please call an ambulance! It's an emergency!",
        textAr: "من فضلك اتصل بسيارة إسعاف! إنها حالة طوارئ!",
        pronunciationTip: "'Ambulance' is 'AM-byoo-lans'. 'Emergency' stress on 'MER': 'e-MER-jen-see'.",
        pronunciationTipAr: "'Ambulance' تُنطق 'AM-byoo-lans'. التشديد في 'emergency' على 'MER': 'e-MER-jen-see'.",
        phonetics: "/pliːz kɔːl ən ˈæmbjələns ɪts ən ɪˈmɜːrdʒənsi/",
        difficulty: 'medium'
      },
      {
        text: "I've lost my passport. Where is the nearest police station?",
        textAr: "فقدت جواز سفري. أين أقرب مركز شرطة؟",
        pronunciationTip: "'I've lost' contracts 'I have'. 'Passport' is 'PASS-port' with equal stress.",
        pronunciationTipAr: "'I've lost' تختصر 'I have'. 'Passport' تُنطق 'PASS-port' مع تشديد متساوٍ.",
        phonetics: "/aɪv lɒst maɪ ˈpæspɔːrt weər ɪz ðə ˈnɪərɪst pəˈliːs ˈsteɪʃn/",
        difficulty: 'medium'
      },
      {
        text: "There's been an accident. Can you help me?",
        textAr: "حدث حادث. هل يمكنك مساعدتي؟",
        pronunciationTip: "'There's been' links together. 'Accident' stress on first: 'AK-si-dent'.",
        pronunciationTipAr: "'There's been' تترابط معاً. التشديد في 'accident' على الأول: 'AK-si-dent'.",
        phonetics: "/ðeərz biːn ən ˈæksɪdənt kæn juː help miː/",
        difficulty: 'medium'
      }
    ]
  },
  {
    category: "Hotel",
    categoryAr: "فندق",
    level: "INTERMEDIATE",
    prompts: [
      {
        text: "I have a reservation under the name Smith.",
        textAr: "لدي حجز باسم سميث.",
        pronunciationTip: "'Reservation' stress on third syllable: 'rez-er-VAY-shun'. Clear 'th' sound in 'the'.",
        pronunciationTipAr: "التشديد في 'reservation' على المقطع الثالث: 'rez-er-VAY-shun'. صوت 'th' واضح في 'the'.",
        phonetics: "/aɪ hæv ə ˌrezərˈveɪʃn ˈʌndər ðə neɪm smɪθ/",
        difficulty: 'medium'
      },
      {
        text: "Could I get a room with a view, please?",
        textAr: "هل يمكنني الحصول على غرفة بإطلالة، من فضلك؟",
        pronunciationTip: "'View' rhymes with 'new'. The 'v' sound requires upper teeth on lower lip.",
        pronunciationTipAr: "'View' تتناغم مع 'new'. صوت 'v' يتطلب الأسنان العلوية على الشفة السفلية.",
        phonetics: "/kʊd aɪ ɡet ə ruːm wɪð ə vjuː pliːz/",
        difficulty: 'easy'
      },
      {
        text: "What time is breakfast served?",
        textAr: "في أي وقت يُقدم الإفطار؟",
        pronunciationTip: "'Breakfast' is two syllables: 'BREK-fust'. 'Served' has a soft 'd' at the end.",
        pronunciationTipAr: "'Breakfast' مقطعين: 'BREK-fust'. 'Served' لها 'd' ناعمة في النهاية.",
        phonetics: "/wɒt taɪm ɪz ˈbrekfəst sɜːrvd/",
        difficulty: 'easy'
      },
      {
        text: "The air conditioning isn't working. Could you send someone to fix it?",
        textAr: "المكيف لا يعمل. هل يمكنك إرسال أحد لإصلاحه؟",
        pronunciationTip: "'Air conditioning' - 'con-DI-shun-ing'. 'Isn't' contracts 'is not' with clear 'z' sound.",
        pronunciationTipAr: "'Air conditioning' - 'con-DI-shun-ing'. 'Isn't' تختصر 'is not' مع صوت 'z' واضح.",
        phonetics: "/ðə eər kənˈdɪʃənɪŋ ˈɪznt ˈwɜːrkɪŋ kʊd juː send ˈsʌmwʌn tuː fɪks ɪt/",
        difficulty: 'hard'
      }
    ]
  },
  {
    category: "Social Events",
    categoryAr: "المناسبات الاجتماعية",
    level: "ADVANCED",
    prompts: [
      {
        text: "Congratulations on your promotion! You really deserve it.",
        textAr: "مبروك على الترقية! أنت تستحقها حقاً.",
        pronunciationTip: "'Congratulations' has 5 syllables: 'con-GRAT-yoo-LAY-shunz'. 'Deserve' stress on 'SERVE'.",
        pronunciationTipAr: "'Congratulations' لها 5 مقاطع: 'con-GRAT-yoo-LAY-shunz'. التشديد في 'deserve' على 'SERVE'.",
        phonetics: "/kənˌɡrætʃəˈleɪʃnz ɒn jɔːr prəˈmoʊʃn juː ˈrɪəli dɪˈzɜːrv ɪt/",
        difficulty: 'hard'
      },
      {
        text: "It was lovely meeting you. Let's keep in touch!",
        textAr: "كان من الرائع مقابلتك. لنبق على تواصل!",
        pronunciationTip: "'Lovely' is 'LUV-lee'. 'Keep in touch' links together naturally as one phrase.",
        pronunciationTipAr: "'Lovely' تُنطق 'LUV-lee'. 'Keep in touch' تترابط طبيعياً كعبارة واحدة.",
        phonetics: "/ɪt wɒz ˈlʌvli ˈmiːtɪŋ juː lets kiːp ɪn tʌtʃ/",
        difficulty: 'easy'
      },
      {
        text: "Would you like to join us for dinner this weekend?",
        textAr: "هل تود الانضمام إلينا لتناول العشاء هذا الأسبوع؟",
        pronunciationTip: "'Would you' often sounds like 'wudja' in casual speech. 'Weekend' stress on 'WEEK'.",
        pronunciationTipAr: "'Would you' غالباً تبدو مثل 'wudja' في الحديث العادي. التشديد في 'weekend' على 'WEEK'.",
        phonetics: "/wʊd juː laɪk tuː dʒɔɪn ʌs fɔːr ˈdɪnər ðɪs ˈwiːkend/",
        difficulty: 'medium'
      },
      {
        text: "I'm sorry, but I already have plans. Maybe next time?",
        textAr: "أنا آسف، لكن لدي خطط بالفعل. ربما المرة القادمة؟",
        pronunciationTip: "'I'm sorry' - sound genuinely apologetic. 'Already' is 'awl-RED-ee', stress on 'RED'.",
        pronunciationTipAr: "'I'm sorry' - اجعلها تبدو صادقة في الاعتذار. 'Already' تُنطق 'awl-RED-ee'، التشديد على 'RED'.",
        phonetics: "/aɪm ˈsɒri bʌt aɪ ɔːlˈredi hæv plænz ˈmeɪbi nekst taɪm/",
        difficulty: 'medium'
      }
    ]
  }
]
