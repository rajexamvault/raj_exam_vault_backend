const { Exam, ExamStage, Subject, Topic, SyllabusItem } = require('../../models');

const RAS_STAGES = [
  {
    name: 'Preliminary Examination (Screening Test)',
    stageOrder: 1,
    durationMinutes: 180,
    totalMarks: 200,
    negativeMarking: 0.33,
    description: 'Single objective type paper consisting of General Knowledge and General Science to screen candidates for the Mains Examination.',
    status: 'active',
    subjects: [
      {
        name: 'History, Art, Culture, Literature, Tradition & Heritage of Rajasthan',
        code: 'RAJ-HIST-ART',
        totalMarks: 65,
        displayOrder: 1,
        topics: [
          {
            name: 'Major Dynasties of Rajasthan & Administration',
            estimatedHours: 12,
            difficultyLevel: 'medium',
            items: [
              { title: 'Dynastic Rule of Guhilas, Sisodias, Rathores, Kachwahas, Chauhans and Bhattis', importance: 'very_high', weightage: 8 },
              { title: 'Administrative and Revenue Setup during Princely State Era', importance: 'high', weightage: 5 }
            ]
          },
          {
            name: 'Architectural Heritage: Forts, Palaces & Stepwells',
            estimatedHours: 8,
            difficultyLevel: 'easy',
            items: [
              { title: 'UNESCO Hill Forts: Chittorgarh, Kumbhalgarh, Ranthambore, Amber, Jaisalmer, Gagron', importance: 'very_high', weightage: 6 },
              { title: 'Traditional Water Architecture: Bawadis, Kunds, and Tankas of Thar Desert', importance: 'medium', weightage: 4 }
            ]
          },
          {
            name: 'Folk Arts, Paintings, Crafts & Festivals of Rajasthan',
            estimatedHours: 10,
            difficultyLevel: 'medium',
            items: [
              { title: 'Schools of Rajasthani Painting: Mewar, Marwar, Hadoti, and Dhundhar styles', importance: 'high', weightage: 5 },
              { title: 'Folk Dances & Folk Deities: Ghoomar, Kalbelia, Ramdevji, Pabuji, Tejaji', importance: 'very_high', weightage: 6 }
            ]
          }
        ]
      },
      {
        name: 'Geography of Rajasthan & Natural Resources',
        code: 'RAJ-GEO',
        totalMarks: 50,
        displayOrder: 2,
        topics: [
          {
            name: 'Physiographic Divisions & Climate',
            estimatedHours: 9,
            difficultyLevel: 'medium',
            items: [
              { title: 'Four Major Zones: Western Sandy Plains, Aravalli Range, Eastern Plains, Hadoti Plateau', importance: 'very_high', weightage: 7 },
              { title: 'Climatic classification: Koppen and Thornthwaite schemes applied to Rajasthan', importance: 'high', weightage: 5 }
            ]
          },
          {
            name: 'Drainage Systems, Rivers & Lakes',
            estimatedHours: 7,
            difficultyLevel: 'easy',
            items: [
              { title: 'Internal Drainage Rivers (Ghaggar, Kantli, Sabi) vs Arabian Sea and Bay of Bengal systems', importance: 'high', weightage: 6 }
            ]
          }
        ]
      },
      {
        name: 'Indian & Rajasthan Economy, Planning & State Schemes',
        code: 'RAJ-ECON-SCHEMES',
        totalMarks: 45,
        displayOrder: 3,
        topics: [
          {
            name: 'Major Flagship Welfare Schemes of Rajasthan',
            estimatedHours: 10,
            difficultyLevel: 'hard',
            items: [
              { title: 'Mukhyamantri Ayushman Arogya Yojana and Free Medicine / Diagnostic Schemes', importance: 'very_high', weightage: 8 },
              { title: 'Indira Gandhi Urban Employment Guarantee & Rural Livelihood Missions', importance: 'high', weightage: 5 }
            ]
          }
        ]
      },
      {
        name: 'General Science, Technology & Environment',
        code: 'GEN-SCI-TECH',
        totalMarks: 40,
        displayOrder: 4,
        topics: [
          {
            name: 'Defense & Space Technology in India',
            estimatedHours: 6,
            difficultyLevel: 'medium',
            items: [
              { title: 'ISRO Launch Vehicles (PSLV, GSLV, LVM3) and Moon / Solar missions', importance: 'high', weightage: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Main Examination (Descriptive & Analytical)',
    stageOrder: 2,
    durationMinutes: 720,
    totalMarks: 800,
    negativeMarking: 0,
    description: 'Four compulsory descriptive papers of 200 marks each spanning General Studies I, II, III and General Hindi / English.',
    status: 'active',
    subjects: [
      {
        name: 'Paper I: General Studies I (History, Economics, Sociology, Management)',
        code: 'MAINS-PAPER-1',
        totalMarks: 200,
        displayOrder: 1,
        topics: [
          {
            name: 'History, Art, Culture, Literature and Heritage',
            estimatedHours: 25,
            difficultyLevel: 'hard',
            items: [
              { title: 'Historical Journey of Rajasthan from Pre-historic times to 1956 integration', importance: 'very_high', weightage: 20 }
            ]
          },
          {
            name: 'Indian & World Economy with focus on Rajasthan',
            estimatedHours: 20,
            difficultyLevel: 'hard',
            items: [
              { title: 'Agricultural Growth, Agri-business Policy, and Industrial corridors in Rajasthan', importance: 'high', weightage: 15 }
            ]
          }
        ]
      },
      {
        name: 'Paper II: General Studies II (Ethics, General Science, Geography)',
        code: 'MAINS-PAPER-2',
        totalMarks: 200,
        displayOrder: 2,
        topics: [
          {
            name: 'Administrative Ethics & Human Values',
            estimatedHours: 18,
            difficultyLevel: 'medium',
            items: [
              { title: 'Role of ethics in public governance and code of conduct for civil servants', importance: 'very_high', weightage: 18 }
            ]
          }
        ]
      },
      {
        name: 'Paper III: General Studies III (Polity, Public Administration, Sports & Law)',
        code: 'MAINS-PAPER-3',
        totalMarks: 200,
        displayOrder: 3,
        topics: [
          {
            name: 'Indian Political System & Rajasthan State Administration',
            estimatedHours: 22,
            difficultyLevel: 'hard',
            items: [
              { title: 'Constitutional positions: Governor, Chief Minister, State Secretariat & Chief Secretary', importance: 'very_high', weightage: 22 }
            ]
          }
        ]
      },
      {
        name: 'Paper IV: General Hindi & General English',
        code: 'MAINS-PAPER-4',
        totalMarks: 200,
        displayOrder: 4,
        topics: [
          {
            name: 'सामान्य हिंदी (व्याकरण, संक्षिप्तीकरण, पल्लवन एवं निबंध)',
            estimatedHours: 20,
            difficultyLevel: 'medium',
            items: [
              { title: 'संधि, समास, उपसर्ग, प्रत्यय, मुहावरे, लोकोक्तियां एवं प्रशासनिक पारिभाषिक शब्दावली', importance: 'very_high', weightage: 25 }
            ]
          },
          {
            name: 'General English (Grammar, Comprehension, Essay & Precis)',
            estimatedHours: 15,
            difficultyLevel: 'medium',
            items: [
              { title: 'Tenses, Active-Passive Voice, Direct-Indirect, Precis Writing and Official Letter Drafting', importance: 'high', weightage: 20 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Personality Test & Viva-Voce (Interview)',
    stageOrder: 3,
    durationMinutes: 45,
    totalMarks: 100,
    negativeMarking: 0,
    description: 'Personal interview conducted by the RPSC Board to test candidate personality, leadership acumen, and awareness of Rajasthan issues.',
    status: 'active',
    subjects: [
      {
        name: 'Board Assessment of Character, Personality & State Awareness',
        code: 'INTERVIEW-ASSESSMENT',
        totalMarks: 100,
        displayOrder: 1,
        topics: [
          {
            name: 'Current Socio-Economic Affairs & Administrative Problem Solving',
            estimatedHours: 10,
            difficultyLevel: 'hard',
            items: [
              { title: 'Live case studies on district law and order, flood/drought management, and public service delivery', importance: 'very_high', weightage: 50 }
            ]
          }
        ]
      }
    ]
  }
];

async function seedSyllabusHierarchy() {
  try {
    console.log('🌱 Starting Syllabus Hierarchy Seeder...');
    const rasExam = await Exam.findOne({ where: { slug: 'rpsc-ras' } });
    if (!rasExam) {
      console.log('⚠️ RPSC RAS exam record not found, skipping hierarchy seeding.');
      return;
    }

    const examId = rasExam.id;

    for (const stageData of RAS_STAGES) {
      let stage = await ExamStage.findOne({
        where: { examId, stageOrder: stageData.stageOrder }
      });

      if (!stage) {
        stage = await ExamStage.create({
          examId,
          name: stageData.name,
          stageOrder: stageData.stageOrder,
          durationMinutes: stageData.durationMinutes,
          totalMarks: stageData.totalMarks,
          negativeMarking: stageData.negativeMarking,
          description: stageData.description,
          status: stageData.status
        });
        console.log(`   + Created Exam Stage: ${stage.name}`);
      }

      for (const subData of stageData.subjects || []) {
        let subject = await Subject.findOne({
          where: { stageId: stage.id, name: subData.name }
        });

        if (!subject) {
          subject = await Subject.create({
            stageId: stage.id,
            examId,
            name: subData.name,
            code: subData.code,
            totalMarks: subData.totalMarks,
            displayOrder: subData.displayOrder
          });
          console.log(`     - Created Subject: ${subject.name}`);
        }

        for (const topicData of subData.topics || []) {
          let topic = await Topic.findOne({
            where: { subjectId: subject.id, name: topicData.name }
          });

          if (!topic) {
            topic = await Topic.create({
              subjectId: subject.id,
              name: topicData.name,
              estimatedHours: topicData.estimatedHours,
              difficultyLevel: topicData.difficultyLevel,
              status: 'active'
            });
            console.log(`       * Created Topic: ${topic.name}`);
          }

          for (const itemData of topicData.items || []) {
            let item = await SyllabusItem.findOne({
              where: { stageId: stage.id, subjectId: subject.id, topicId: topic.id, title: itemData.title }
            });

            if (!item) {
              await SyllabusItem.create({
                examId,
                stageId: stage.id,
                subjectId: subject.id,
                topicId: topic.id,
                title: itemData.title,
                importance: itemData.importance,
                weightage: itemData.weightage,
                status: 'active'
              });
            }
          }
        }
      }
    }

    console.log('✅ Syllabus Hierarchy seeded successfully for RPSC RAS!');
  } catch (err) {
    console.error('❌ Syllabus hierarchy seeding failed:', err);
  }
}

module.exports = { seedSyllabusHierarchy };

if (require.main === module) {
  const { sequelize } = require('../../models');
  sequelize.authenticate()
    .then(() => seedSyllabusHierarchy())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
