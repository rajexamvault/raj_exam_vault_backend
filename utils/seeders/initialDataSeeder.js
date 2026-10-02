const { Exam, Announcement, CurrentAffair, StudyMaterial, User, Role } = require('../../models');

const SAMPLE_EXAMS = [
  {
    title: 'RPSC Rajasthan Administrative Services (RAS / RTS)',
    shortName: 'RAS',
    slug: 'rpsc-ras',
    category: 'State Civil Services',
    department: 'Rajasthan Public Service Commission (RPSC)',
    examType: 'Officer Cadre',
    description: 'Premier administrative examination conducted by RPSC for recruitment to Rajasthan Administrative Service (RAS), Rajasthan Police Service (RPS), and Allied Services.',
    eligibility: 'Graduate from any recognized university. Age: 21 to 40 years (relaxation as per Rajasthan Govt rules).',
    officialWebsite: 'https://rpsc.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 1,
    status: 'active'
  },
  {
    title: 'REET Rajasthan Eligibility Examination for Teachers (Level 1 & 2)',
    shortName: 'REET',
    slug: 'reet-level-1-2',
    category: 'Teaching & Education',
    department: 'Board of Secondary Education, Rajasthan (BSER)',
    examType: 'Teacher Eligibility',
    description: 'State-level eligibility test conducted for primary (Classes 1-5, Level 1) and upper primary (Classes 6-8, Level 2) government school teachers.',
    eligibility: 'Level 1: 12th + D.El.Ed / BSTC. Level 2: Graduation + B.Ed / D.El.Ed.',
    officialWebsite: 'https://rajeduboard.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 2,
    status: 'active'
  },
  {
    title: 'Rajasthan Police Sub-Inspector (SI) & Platoon Commander',
    shortName: 'Rajasthan Police SI',
    slug: 'rajasthan-police-si',
    category: 'Uniformed Services',
    department: 'Rajasthan Police / RPSC',
    examType: 'Direct Recruitment',
    description: 'Recruitment examination for Sub-Inspectors of Police in Rajasthan Police Force including Executive, IB, and RAC wings.',
    eligibility: 'Bachelor’s Degree in any discipline + Physical Efficiency Standards. Age: 20-25 years.',
    officialWebsite: 'https://police.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 3,
    status: 'active'
  },
  {
    title: 'RSMSSB Common Eligibility Test (CET) - Graduation Level',
    shortName: 'CET Graduate',
    slug: 'rsmssb-cet-graduation-level',
    category: 'State Civil Services',
    department: 'Rajasthan Staff Selection Board (RSMSSB)',
    examType: 'Common Eligibility',
    description: 'Mandatory qualifying test for various non-gazetted posts including Platoon Commander, Hostel Superintendent, Junior Accountant, and Patwari.',
    eligibility: 'Graduate in any discipline. Score card valid for 1 year.',
    officialWebsite: 'https://rsmssb.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 4,
    status: 'active'
  },
  {
    title: 'RSMSSB Common Eligibility Test (CET) - Senior Secondary (12th Level)',
    shortName: 'CET 12th',
    slug: 'rsmssb-cet-12th-level',
    category: 'State Civil Services',
    department: 'Rajasthan Staff Selection Board (RSMSSB)',
    examType: 'Common Eligibility',
    description: 'Single-window qualifying exam for posts such as Constable, Junior Assistant, Clerk Grade-II, and Forester.',
    eligibility: '10+2 (Senior Secondary) from any recognized board. Age: 18 to 40 years.',
    officialWebsite: 'https://rsmssb.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 5,
    status: 'active'
  },
  {
    title: 'Rajasthan Patwari Recruitment Examination',
    shortName: 'Patwari',
    slug: 'rajasthan-patwari',
    category: 'Revenue & Land Records',
    department: 'Board of Revenue Rajasthan / RSMSSB',
    examType: 'Direct Recruitment',
    description: 'Recruitment for land revenue officers (Patwari) across all districts of Rajasthan.',
    eligibility: 'Graduation + RSCIT or equivalent computer certificate.',
    officialWebsite: 'https://rsmssb.rajasthan.gov.in',
    isFeatured: true,
    displayOrder: 6,
    status: 'active'
  },
  {
    title: 'Rajasthan Gram Vikas Adhikari (VDO / Village Development Officer)',
    shortName: 'VDO',
    slug: 'rajasthan-vdo',
    category: 'Panchayati Raj & Rural Development',
    department: 'Rural Development and Panchayati Raj Department / RSMSSB',
    examType: 'Direct Recruitment',
    description: 'Recruitment for Village Development Officers managing rural infrastructure and welfare programs.',
    eligibility: 'Graduation + recognized Computer qualification (RSCIT).',
    officialWebsite: 'https://rsmssb.rajasthan.gov.in',
    isFeatured: false,
    displayOrder: 7,
    status: 'active'
  },
  {
    title: 'Rajasthan Police Constable Recruitment',
    shortName: 'Police Constable',
    slug: 'rajasthan-police-constable',
    category: 'Uniformed Services',
    department: 'Rajasthan Police Department',
    examType: 'Direct Recruitment',
    description: 'District police, RAC, telecommunications, and driver constable recruitment.',
    eligibility: '12th Pass (CET 12th Level qualified) + Physical Standards.',
    officialWebsite: 'https://police.rajasthan.gov.in',
    isFeatured: false,
    displayOrder: 8,
    status: 'active'
  }
];

const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'RPSC RAS 2026 Preliminary Exam Date Announced: Check Official Schedule',
    slug: 'rpsc-ras-2026-prelims-exam-date',
    announcementType: 'exam_date',
    priority: 'urgent_flash',
    summary: 'RPSC has officially issued the notification for RAS Prelims 2026. The examination is slated across all district headquarters.',
    publishDate: new Date().toISOString().split('T')[0],
    isFlashTicker: true,
    status: 'active'
  },
  {
    title: 'RSMSSB CET (Graduation Level) 2026 Detailed Syllabus & Scheme Released',
    slug: 'rsmssb-cet-graduation-2026-syllabus',
    announcementType: 'syllabus_revision',
    priority: 'high',
    summary: 'Revised syllabus focusing on Rajasthan History, Culture, Geography, and Current Affairs published by the board.',
    publishDate: new Date().toISOString().split('T')[0],
    isFlashTicker: true,
    status: 'active'
  },
  {
    title: 'REET 2026 Eligibility Guidelines & District-wise Vacancy Distribution',
    slug: 'reet-2026-district-vacancy-guidelines',
    announcementType: 'vacancy_update',
    priority: 'normal',
    summary: 'Education Department releases preliminary vacancy matrix for Level 1 and Level 2 teacher recruitments.',
    publishDate: new Date().toISOString().split('T')[0],
    isFlashTicker: true,
    status: 'active'
  }
];

const SAMPLE_CURRENT_AFFAIRS = [
  {
    titleEnglish: 'Mukhyamantri Ayushman Arogya Yojana: Key Enhancements & Budget Allocations 2026',
    titleHindi: 'मुख्यमंत्री आयुष्मान आरोग्य योजना: मुख्य सुधार एवं बजट आवंटन 2026',
    slug: 'mukhyamantri-ayushman-arogya-yojana-2026-updates',
    category: 'schemes_policies',
    date: new Date().toISOString().split('T')[0],
    summaryEnglish: 'Comprehensive analysis of Rajasthan government health welfare enhancements and hospital tie-up coverage for state exam aspirants.',
    summaryHindi: 'राजस्थान सरकार द्वारा स्वास्थ्य कल्याण योजनाओं के विस्तार और अस्पताल नेटवर्क का संपूर्ण विवरण।',
    isFeatured: true,
    status: 'published'
  },
  {
    titleEnglish: 'Eastern Rajasthan Canal Project (ERCP): Inter-State Water Accord and District Coverage',
    titleHindi: 'पूर्वी राजस्थान नहर परियोजना (ERCP): अंतरराज्यीय जल समझौता और जिला कवरेज',
    slug: 'ercp-rajasthan-water-accord-analysis',
    category: 'rajasthan_special',
    date: new Date().toISOString().split('T')[0],
    summaryEnglish: 'Detailed examination of ERCP project, beneficiary districts, irrigation potentials, and expected questions for RAS Mains and Prelims.',
    summaryHindi: 'ईआरसीपी परियोजना, लाभान्वित 13 जिले, सिंचाई क्षमता और आरएएस मुख्य परीक्षा हेतु महत्वपूर्ण तथ्य।',
    isFeatured: true,
    status: 'published'
  },
  {
    titleEnglish: 'Rajasthan Sahitya Akademi Awards 2026: Distinguished Honorees and Literary Works',
    titleHindi: 'राजस्थान साहित्य अकादमी पुरस्कार 2026: प्रमुख विजेता एवं उनकी कृतियां',
    slug: 'rajasthan-sahitya-akademi-awards-2026-winners',
    category: 'awards_sports',
    date: new Date().toISOString().split('T')[0],
    summaryEnglish: 'List of authors, Rajasthani language poetry, and prose laureates honored by the state academy.',
    summaryHindi: 'राज्य साहित्य अकादमी द्वारा सम्मानित लेखक, राजस्थानी भाषा के कवि और उनकी प्रमुख कृतियों की सूची।',
    isFeatured: true,
    status: 'published'
  }
];

async function seedInitialData() {
  try {
    console.log('🌱 Starting initial data seeding for Raj Exam Vault...');

    // 1. Seed Exams
    for (const examData of SAMPLE_EXAMS) {
      const [exam, created] = await Exam.findOrCreate({
        where: { slug: examData.slug },
        defaults: examData
      });
      if (created) {
        console.log(`   + Created Exam: ${exam.shortName} (${exam.title})`);
      }
    }

    // 2. Seed Announcements
    for (const annData of SAMPLE_ANNOUNCEMENTS) {
      const [ann, created] = await Announcement.findOrCreate({
        where: { slug: annData.slug },
        defaults: annData
      });
      if (created) {
        console.log(`   + Created Announcement: ${ann.title}`);
      }
    }

    // 3. Seed Current Affairs
    for (const caData of SAMPLE_CURRENT_AFFAIRS) {
      const [ca, created] = await CurrentAffair.findOrCreate({
        where: { slug: caData.slug },
        defaults: caData
      });
      if (created) {
        console.log(`   + Created Current Affair: ${ca.title}`);
      }
    }

    console.log('✅ Initial data seeding finished successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

module.exports = { seedInitialData };

if (require.main === module) {
  const { sequelize } = require('../../models');
  sequelize.authenticate()
    .then(() => seedInitialData())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
