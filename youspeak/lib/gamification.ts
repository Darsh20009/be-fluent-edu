import { prisma } from './prisma'

// =============================================
// نظام Gamification - حسابات XP والمستويات
// =============================================

// إعدادات XP لكل نشاط
export const XP_REWARDS = {
  // الكلمات
  WORD_LEARNED: 10,           // تعلم كلمة جديدة
  WORD_REVIEWED: 5,           // مراجعة كلمة
  WORD_MASTERED: 25,          // إتقان كلمة (5 مراجعات صحيحة)
  
  // الدروس
  LESSON_COMPLETED: 50,       // إكمال درس
  EXERCISE_CORRECT: 10,       // إجابة صحيحة في تمرين
  EXERCISE_PERFECT: 20,       // تمرين بدرجة كاملة
  
  // الكتابة
  WRITING_SUBMITTED: 30,      // تقديم كتابة
  WRITING_GRADED: 20,         // استلام تقييم
  WRITING_EXCELLENT: 50,      // كتابة ممتازة (90%+)
  
  // الحضور
  DAILY_LOGIN: 15,            // تسجيل دخول يومي
  STREAK_BONUS: 5,            // مكافأة لكل يوم في السلسلة
  
  // الإنجازات
  FIRST_WORD: 50,             // أول كلمة
  FIRST_LESSON: 100,          // أول درس
  FIRST_WRITING: 75,          // أول كتابة
  
  // الجلسات
  SESSION_ATTENDED: 100,      // حضور جلسة مباشرة
  HOMEWORK_SUBMITTED: 40,     // تقديم واجب
  
  // المحادثة
  CONVERSATION_COMPLETED: 35, // إكمال محادثة تدريبية
  LISTENING_COMPLETED: 30,    // إكمال تمرين استماع
}

// حساب XP المطلوب لكل مستوى (تصاعدي)
export function calculateXPForLevel(level: number): number {
  // صيغة: المستوى 1 = 100 XP، كل مستوى يزيد بـ 50%
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// حساب المستوى من إجمالي XP
export function calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; xpToNextLevel: number } {
  let level = 1
  let xpNeeded = calculateXPForLevel(1)
  let remainingXP = totalXP
  
  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded
    level++
    xpNeeded = calculateXPForLevel(level)
  }
  
  return {
    level,
    currentLevelXP: remainingXP,
    xpToNextLevel: xpNeeded
  }
}

// ألقاب المستويات
export function getLevelTitle(level: number, lang: 'en' | 'ar' = 'ar'): string {
  const titles = {
    en: [
      { min: 1, max: 5, title: 'Beginner' },
      { min: 6, max: 10, title: 'Learner' },
      { min: 11, max: 15, title: 'Explorer' },
      { min: 16, max: 20, title: 'Achiever' },
      { min: 21, max: 30, title: 'Expert' },
      { min: 31, max: 40, title: 'Master' },
      { min: 41, max: 50, title: 'Champion' },
      { min: 51, max: 100, title: 'Legend' },
    ],
    ar: [
      { min: 1, max: 5, title: 'مبتدئ' },
      { min: 6, max: 10, title: 'متعلم' },
      { min: 11, max: 15, title: 'مستكشف' },
      { min: 16, max: 20, title: 'منجز' },
      { min: 21, max: 30, title: 'خبير' },
      { min: 31, max: 40, title: 'محترف' },
      { min: 41, max: 50, title: 'بطل' },
      { min: 51, max: 100, title: 'أسطورة' },
    ]
  }
  
  const titleList = titles[lang]
  const found = titleList.find(t => level >= t.min && level <= t.max)
  return found?.title || (lang === 'ar' ? 'أسطورة' : 'Legend')
}

// إنشاء أو الحصول على سجل gamification للمستخدم
export async function getOrCreateUserGamification(userId: string) {
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
    include: {
      userBadges: {
        include: { Badge: true }
      }
    }
  })
  
  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: {
        userId,
        totalXP: 0,
        currentLevel: 1,
        currentLevelXP: 0,
        xpToNextLevel: 100,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      include: {
        userBadges: {
          include: { Badge: true }
        }
      }
    })
  }
  
  return gamification
}

// إضافة XP للمستخدم
export async function addXP(
  userId: string, 
  xpAmount: number, 
  reason: string,
  activityType?: 'word' | 'lesson' | 'exercise' | 'writing' | 'session' | 'other'
) {
  const gamification = await getOrCreateUserGamification(userId)
  
  const newTotalXP = gamification.totalXP + xpAmount
  const { level, currentLevelXP, xpToNextLevel } = calculateLevelFromXP(newTotalXP)
  
  const leveledUp = level > gamification.currentLevel
  
  // تحديث الإحصائيات حسب نوع النشاط
  const updateData: any = {
    totalXP: newTotalXP,
    currentLevel: level,
    currentLevelXP: currentLevelXP,
    xpToNextLevel: xpToNextLevel,
    totalPoints: gamification.totalPoints + Math.floor(xpAmount / 2),
  }
  
  if (activityType === 'word') {
    updateData.wordsLearned = gamification.wordsLearned + 1
  } else if (activityType === 'lesson') {
    updateData.lessonsCompleted = gamification.lessonsCompleted + 1
  } else if (activityType === 'exercise') {
    updateData.exercisesCompleted = gamification.exercisesCompleted + 1
  } else if (activityType === 'writing') {
    updateData.writingsSubmitted = gamification.writingsSubmitted + 1
  }
  
  const updated = await prisma.userGamification.update({
    where: { id: gamification.id },
    data: updateData,
    include: {
      userBadges: {
        include: { Badge: true }
      }
    }
  })
  
  // تحديث النشاط اليومي
  await updateDailyActivity(gamification.id, xpAmount, activityType)
  
  // التحقق من الشارات الجديدة
  await checkAndAwardBadges(userId)
  
  return {
    gamification: updated,
    xpAdded: xpAmount,
    leveledUp,
    newLevel: leveledUp ? level : null,
    reason
  }
}

// تحديث النشاط اليومي
async function updateDailyActivity(
  gamificationId: string, 
  xpEarned: number,
  activityType?: string
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const updateData: any = {
    xpEarned: { increment: xpEarned },
    pointsEarned: { increment: Math.floor(xpEarned / 2) },
    activitiesCount: { increment: 1 },
  }
  
  if (activityType === 'word') {
    updateData.wordsLearned = { increment: 1 }
  } else if (activityType === 'lesson') {
    updateData.lessonsCompleted = { increment: 1 }
  } else if (activityType === 'exercise') {
    updateData.exercisesDone = { increment: 1 }
  }
  
  await prisma.dailyActivity.upsert({
    where: {
      gamificationId_date: {
        gamificationId,
        date: today
      }
    },
    create: {
      gamificationId,
      date: today,
      xpEarned,
      pointsEarned: Math.floor(xpEarned / 2),
      activitiesCount: 1,
      wordsLearned: activityType === 'word' ? 1 : 0,
      lessonsCompleted: activityType === 'lesson' ? 1 : 0,
      exercisesDone: activityType === 'exercise' ? 1 : 0,
    },
    update: updateData
  })
}

// تحديث الـ Streak اليومي
export async function updateStreak(userId: string) {
  const gamification = await getOrCreateUserGamification(userId)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  let newStreak = gamification.currentStreak
  let xpBonus = 0
  
  if (!gamification.lastActiveDate) {
    newStreak = 1
    xpBonus = XP_REWARDS.DAILY_LOGIN
  } else {
    const lastActive = new Date(gamification.lastActiveDate)
    lastActive.setHours(0, 0, 0, 0)
    
    if (lastActive.getTime() === yesterday.getTime()) {
      newStreak = gamification.currentStreak + 1
      xpBonus = XP_REWARDS.DAILY_LOGIN + (newStreak * XP_REWARDS.STREAK_BONUS)
    } else if (lastActive.getTime() === today.getTime()) {
      return { streak: gamification.currentStreak, xpBonus: 0 }
    } else {
      newStreak = 1
      xpBonus = XP_REWARDS.DAILY_LOGIN
    }
  }
  
  const newLongestStreak = Math.max(newStreak, gamification.longestStreak)
  const newTotalXP = gamification.totalXP + xpBonus
  const { level, currentLevelXP, xpToNextLevel } = calculateLevelFromXP(newTotalXP)
  
  await prisma.userGamification.update({
    where: { id: gamification.id },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today,
      totalXP: newTotalXP,
      currentLevel: level,
      currentLevelXP: currentLevelXP,
      xpToNextLevel: xpToNextLevel,
      totalPoints: gamification.totalPoints + Math.floor(xpBonus / 2),
    }
  })
  
  await checkAndAwardBadges(userId)
  
  return { streak: newStreak, xpBonus }
}

// التحقق من الشارات ومنحها
export async function checkAndAwardBadges(userId: string) {
  const gamification = await getOrCreateUserGamification(userId)
  const earnedBadgeIds = gamification.userBadges.map(ub => ub.badgeId)
  
  // الحصول على جميع الشارات النشطة
  const allBadges = await prisma.badge.findMany({
    where: { isActive: true }
  })
  
  const newBadges = []
  
  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue
    
    const requirement = JSON.parse(badge.requirement)
    let earned = false
    
    // التحقق من المتطلبات
    switch (requirement.type) {
      case 'streak':
        earned = gamification.currentStreak >= requirement.value
        break
      case 'words':
        earned = gamification.wordsLearned >= requirement.value
        break
      case 'lessons':
        earned = gamification.lessonsCompleted >= requirement.value
        break
      case 'xp':
        earned = gamification.totalXP >= requirement.value
        break
      case 'level':
        earned = gamification.currentLevel >= requirement.value
        break
      case 'exercises':
        earned = gamification.exercisesCompleted >= requirement.value
        break
      case 'writings':
        earned = gamification.writingsSubmitted >= requirement.value
        break
      case 'perfect_scores':
        earned = gamification.perfectScores >= requirement.value
        break
    }
    
    if (earned) {
      await prisma.userBadge.create({
        data: {
          gamificationId: gamification.id,
          badgeId: badge.id,
        }
      })
      
      if (badge.xpReward > 0) {
        const updatedGamification = await prisma.userGamification.findUnique({
          where: { id: gamification.id }
        })
        
        if (updatedGamification) {
          const newTotalXP = updatedGamification.totalXP + badge.xpReward
          const { level, currentLevelXP, xpToNextLevel } = calculateLevelFromXP(newTotalXP)
          
          await prisma.userGamification.update({
            where: { id: gamification.id },
            data: {
              totalXP: newTotalXP,
              currentLevel: level,
              currentLevelXP: currentLevelXP,
              xpToNextLevel: xpToNextLevel,
              totalPoints: updatedGamification.totalPoints + badge.pointsReward
            }
          })
        }
      }
      
      newBadges.push(badge)
    }
  }
  
  return newBadges
}

// الحصول على لوحة المتصدرين
export async function getLeaderboard(limit: number = 20, type: 'xp' | 'streak' | 'level' = 'xp') {
  const orderBy = type === 'xp' 
    ? { totalXP: 'desc' as const }
    : type === 'streak'
    ? { currentStreak: 'desc' as const }
    : { currentLevel: 'desc' as const }
  
  const leaderboard = await prisma.userGamification.findMany({
    take: limit,
    orderBy,
    include: {
      User: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        }
      }
    }
  })
  
  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: entry.User.name,
    profilePhoto: entry.User.profilePhoto,
    totalXP: entry.totalXP,
    currentLevel: entry.currentLevel,
    currentStreak: entry.currentStreak,
    levelTitle: getLevelTitle(entry.currentLevel),
  }))
}

// الحصول على ترتيب المستخدم
export async function getUserRank(userId: string) {
  const userGamification = await getOrCreateUserGamification(userId)
  
  const higherRanked = await prisma.userGamification.count({
    where: {
      totalXP: { gt: userGamification.totalXP }
    }
  })
  
  return higherRanked + 1
}

// الشارات الافتراضية
export const DEFAULT_BADGES = [
  // شارات الـ Streak
  {
    name: 'First Day',
    nameAr: 'اليوم الأول',
    description: 'Complete your first day of learning',
    descriptionAr: 'أكمل يومك الأول من التعلم',
    icon: '🌟',
    category: 'STREAK',
    requirement: JSON.stringify({ type: 'streak', value: 1 }),
    xpReward: 50,
    pointsReward: 25,
    rarity: 'COMMON',
    order: 1
  },
  {
    name: 'Week Warrior',
    nameAr: 'محارب الأسبوع',
    description: 'Maintain a 7-day streak',
    descriptionAr: 'حافظ على سلسلة 7 أيام',
    icon: '🔥',
    category: 'STREAK',
    requirement: JSON.stringify({ type: 'streak', value: 7 }),
    xpReward: 150,
    pointsReward: 75,
    rarity: 'UNCOMMON',
    order: 2
  },
  {
    name: 'Month Master',
    nameAr: 'سيد الشهر',
    description: 'Maintain a 30-day streak',
    descriptionAr: 'حافظ على سلسلة 30 يوم',
    icon: '💪',
    category: 'STREAK',
    requirement: JSON.stringify({ type: 'streak', value: 30 }),
    xpReward: 500,
    pointsReward: 250,
    rarity: 'RARE',
    order: 3
  },
  {
    name: 'Century Streak',
    nameAr: 'سلسلة المائة',
    description: 'Maintain a 100-day streak',
    descriptionAr: 'حافظ على سلسلة 100 يوم',
    icon: '🏆',
    category: 'STREAK',
    requirement: JSON.stringify({ type: 'streak', value: 100 }),
    xpReward: 2000,
    pointsReward: 1000,
    rarity: 'LEGENDARY',
    order: 4
  },
  
  // شارات الكلمات
  {
    name: 'Word Beginner',
    nameAr: 'مبتدئ الكلمات',
    description: 'Learn 10 words',
    descriptionAr: 'تعلم 10 كلمات',
    icon: '📚',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'words', value: 10 }),
    xpReward: 50,
    pointsReward: 25,
    rarity: 'COMMON',
    order: 5
  },
  {
    name: 'Vocabulary Builder',
    nameAr: 'بانٍ المفردات',
    description: 'Learn 50 words',
    descriptionAr: 'تعلم 50 كلمة',
    icon: '📖',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'words', value: 50 }),
    xpReward: 200,
    pointsReward: 100,
    rarity: 'UNCOMMON',
    order: 6
  },
  {
    name: 'Word Master',
    nameAr: 'سيد الكلمات',
    description: 'Learn 200 words',
    descriptionAr: 'تعلم 200 كلمة',
    icon: '🎓',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'words', value: 200 }),
    xpReward: 500,
    pointsReward: 250,
    rarity: 'RARE',
    order: 7
  },
  {
    name: 'Lexicon Legend',
    nameAr: 'أسطورة المعجم',
    description: 'Learn 500 words',
    descriptionAr: 'تعلم 500 كلمة',
    icon: '👑',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'words', value: 500 }),
    xpReward: 1500,
    pointsReward: 750,
    rarity: 'LEGENDARY',
    order: 8
  },
  
  // شارات المستوى
  {
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    description: 'Reach level 5',
    descriptionAr: 'وصل للمستوى 5',
    icon: '⭐',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'level', value: 5 }),
    xpReward: 100,
    pointsReward: 50,
    rarity: 'COMMON',
    order: 9
  },
  {
    name: 'Double Digits',
    nameAr: 'الأرقام المزدوجة',
    description: 'Reach level 10',
    descriptionAr: 'وصل للمستوى 10',
    icon: '🌟',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'level', value: 10 }),
    xpReward: 300,
    pointsReward: 150,
    rarity: 'UNCOMMON',
    order: 10
  },
  {
    name: 'Quarter Century',
    nameAr: 'ربع قرن',
    description: 'Reach level 25',
    descriptionAr: 'وصل للمستوى 25',
    icon: '💎',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'level', value: 25 }),
    xpReward: 750,
    pointsReward: 375,
    rarity: 'RARE',
    order: 11
  },
  {
    name: 'Half Century',
    nameAr: 'نصف قرن',
    description: 'Reach level 50',
    descriptionAr: 'وصل للمستوى 50',
    icon: '🏅',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'level', value: 50 }),
    xpReward: 2000,
    pointsReward: 1000,
    rarity: 'LEGENDARY',
    order: 12
  },
  
  // شارات الدروس
  {
    name: 'First Lesson',
    nameAr: 'الدرس الأول',
    description: 'Complete your first lesson',
    descriptionAr: 'أكمل درسك الأول',
    icon: '📝',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'lessons', value: 1 }),
    xpReward: 50,
    pointsReward: 25,
    rarity: 'COMMON',
    order: 13
  },
  {
    name: 'Lesson Lover',
    nameAr: 'محب الدروس',
    description: 'Complete 10 lessons',
    descriptionAr: 'أكمل 10 دروس',
    icon: '📚',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'lessons', value: 10 }),
    xpReward: 200,
    pointsReward: 100,
    rarity: 'UNCOMMON',
    order: 14
  },
  {
    name: 'Lesson Master',
    nameAr: 'سيد الدروس',
    description: 'Complete 50 lessons',
    descriptionAr: 'أكمل 50 درس',
    icon: '🎯',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'lessons', value: 50 }),
    xpReward: 750,
    pointsReward: 375,
    rarity: 'EPIC',
    order: 15
  },
  
  // شارات الكتابة
  {
    name: 'First Words',
    nameAr: 'الكلمات الأولى',
    description: 'Submit your first writing',
    descriptionAr: 'قدم كتابتك الأولى',
    icon: '✍️',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'writings', value: 1 }),
    xpReward: 75,
    pointsReward: 35,
    rarity: 'COMMON',
    order: 16
  },
  {
    name: 'Prolific Writer',
    nameAr: 'كاتب غزير',
    description: 'Submit 20 writings',
    descriptionAr: 'قدم 20 كتابة',
    icon: '📝',
    category: 'LEARNING',
    requirement: JSON.stringify({ type: 'writings', value: 20 }),
    xpReward: 400,
    pointsReward: 200,
    rarity: 'RARE',
    order: 17
  },
  
  // شارات XP
  {
    name: 'XP Hunter',
    nameAr: 'صياد الخبرة',
    description: 'Earn 1,000 XP',
    descriptionAr: 'اكسب 1,000 نقطة خبرة',
    icon: '💰',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'xp', value: 1000 }),
    xpReward: 100,
    pointsReward: 50,
    rarity: 'COMMON',
    order: 18
  },
  {
    name: 'XP Champion',
    nameAr: 'بطل الخبرة',
    description: 'Earn 10,000 XP',
    descriptionAr: 'اكسب 10,000 نقطة خبرة',
    icon: '🏆',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'xp', value: 10000 }),
    xpReward: 500,
    pointsReward: 250,
    rarity: 'RARE',
    order: 19
  },
  {
    name: 'XP Legend',
    nameAr: 'أسطورة الخبرة',
    description: 'Earn 50,000 XP',
    descriptionAr: 'اكسب 50,000 نقطة خبرة',
    icon: '👑',
    category: 'ACHIEVEMENT',
    requirement: JSON.stringify({ type: 'xp', value: 50000 }),
    xpReward: 2000,
    pointsReward: 1000,
    rarity: 'LEGENDARY',
    order: 20
  },
]

// تهيئة الشارات الافتراضية
export async function initializeDefaultBadges() {
  const existingBadges = await prisma.badge.count()
  
  if (existingBadges === 0) {
    for (const badge of DEFAULT_BADGES) {
      await prisma.badge.create({
        data: badge as any
      })
    }
    console.log('✅ Default badges initialized')
  }
  
  return await prisma.badge.findMany({ orderBy: { order: 'asc' } })
}

// الحصول على إحصائيات المستخدم الكاملة
export async function getUserStats(userId: string) {
  const gamification = await getOrCreateUserGamification(userId)
  const rank = await getUserRank(userId)
  const levelTitle = getLevelTitle(gamification.currentLevel)
  
  return {
    ...gamification,
    rank,
    levelTitle,
    levelTitleEn: getLevelTitle(gamification.currentLevel, 'en'),
    xpProgress: Math.round((gamification.currentLevelXP / gamification.xpToNextLevel) * 100),
  }
}
