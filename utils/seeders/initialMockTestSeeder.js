const { Exam, MockTest, Question, TestQuestion, sequelize } = require('../../models');

const QUESTIONS_DATA = [
  // Question 1
  {
    examSlug: 'rpsc-ras',
    questionHindi: 'प्रसिद्ध चित्रकला "बणी-ठणी" का संबंध राजस्थान की किस चित्रशैली से है?',
    questionEnglish: 'The famous painting "Bani-Thani" is associated with which Rajasthani painting school?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'मेवाड़ शैली', textEnglish: 'Mewar School' },
      { id: 'B', textHindi: 'किशनगढ़ शैली', textEnglish: 'Kishangarh School' },
      { id: 'C', textHindi: 'बूंदी शैली', textEnglish: 'Bundi School' },
      { id: 'D', textHindi: 'मारवाड़ शैली', textEnglish: 'Marwar School' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'बणी-ठणी किशनगढ़ शैली का सर्वश्रेष्ठ उदाहरण है। इसे निहालचंद ने चित्रित किया था और राजा सावंत सिंह (नागरीदास) के समय इसका चरमोत्कर्ष हुआ। एरिक डिक्सन ने इसे "भारत की मोनालिसा" कहा।',
    explanationEnglish: 'Bani Thani is the pinnacle of the Kishangarh style of painting, created by Nihal Chand during the reign of King Sawant Singh (Nagridas). Eric Dickinson described it as "India\'s Mona Lisa".',
    difficultyLevel: 'easy',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Art & Culture', 'Paintings', 'Rajasthan History']
  },

  // Question 2
  {
    examSlug: 'rpsc-ras',
    questionHindi: 'राजस्थान में ऐतिहासिक "बिजौलिया किसान आंदोलन" के जनक और मुख्य नेतृत्वकर्ता कौन थे?',
    questionEnglish: 'Who was the pioneer and chief leader of the historic "Bijolia Peasant Movement" in Rajasthan?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'माणिक्य लाल वर्मा', textEnglish: 'Manikya Lal Verma' },
      { id: 'B', textHindi: 'विजय सिंह पथिक (भूप सिंह)', textEnglish: 'Vijay Singh Pathik (Bhup Singh)' },
      { id: 'C', textHindi: 'साधु सीताराम दास', textEnglish: 'Sadhu Sitaram Das' },
      { id: 'D', textHindi: 'गोविंद गिरी', textEnglish: 'Govind Giri' },
    ],
    correctAnswer: 'B',
    explanationHindi: 'बिजौलिया किसान आंदोलन 1897 से 1941 तक (44 वर्ष) अहिंसक रूप से चला। साधु सीताराम दास के आग्रह पर विजय सिंह पथिक ने 1916 में इसका नेतृत्व संभाला और इसे राष्ट्रीय स्तर पर पहुंचाया।',
    explanationEnglish: 'The Bijolia Peasant Movement was an unflagging 44-year non-violent struggle (1897–1941). Vijay Singh Pathik took charge in 1916 upon the request of Sadhu Sitaram Das and brought it to national acclaim.',
    difficultyLevel: 'medium',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Peasant Movement', 'Freedom Struggle', 'Rajasthan History']
  },

  // Question 3
  {
    examSlug: 'rpsc-ras',
    questionHindi: 'अरावली पर्वतमाला की सर्वोच्च चोटी "गुरु शिखर" (1722 मीटर) किस जिले में स्थित है?',
    questionEnglish: 'In which district of Rajasthan is "Guru Shikhar" (1722 m), the highest peak of the Aravalli Range, located?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'उदयपुर', textEnglish: 'Udaipur' },
      { id: 'B', textHindi: 'सिरोही (माउंट आबू)', textEnglish: 'Sirohi (Mount Abu)' },
      { id: 'C', textHindi: 'राजसमंद', textEnglish: 'Rajsamand' },
      { id: 'D', textHindi: 'अजमेर', textEnglish: 'Ajmer' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'गुरु शिखर (1722 मीटर) सिरोही जिले में माउंट आबू में स्थित है। कर्नल जेम्स टॉड ने इसे "संतों का शिखर" (Peak of Saints) कहा था।',
    explanationEnglish: 'Guru Shikhar (1,722 m) is situated at Mount Abu in Sirohi district. Col. James Tod bestowed it the title of "Peak of Saints".',
    difficultyLevel: 'easy',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Geography', 'Aravalli Range', 'Physiography']
  },

  // Question 4
  {
    examSlug: 'rpsc-ras',
    questionHindi: 'राजस्थान में मरुस्थलीकरण की रोकथाम और जल आपूर्ति हेतु "इंदिरा गांधी नहर" (IGNP) का उद्गम किस बैराज से होता है?',
    questionEnglish: 'From which barrage does the Indira Gandhi Canal (IGNP) originate to mitigate desertification in Rajasthan?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'भाखड़ा नांगल बैराज', textEnglish: 'Bhakra Nangal Barrage' },
      { id: 'B', textHindi: 'हरिके बैराज (सतलुज-व्यास संगम)', textEnglish: 'Harike Barrage (Satluj-Beas Confluence)' },
      { id: 'C', textHindi: 'पोंग बांध', textEnglish: 'Pong Dam' },
      { id: 'D', textHindi: 'कोटा बैराज', textEnglish: 'Kota Barrage' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'इंदिरा गांधी नहर परियोजना (IGNP) पंजाब में सतलुज और व्यास नदियों के संगम पर स्थित हरिके बैराज से निकलती है। इसे राजस्थान की जीवन रेखा (Maru Ganga) कहा जाता है।',
    explanationEnglish: 'The Indira Gandhi Canal Project (IGNP) originates from Harike Barrage at the confluence of Satluj and Beas in Punjab, hailed as the Lifeline of Western Rajasthan (Maru Ganga).',
    difficultyLevel: 'medium',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Irrigation', 'Geography', 'Water Resources']
  },

  // Question 5
  {
    examSlug: 'rpsc-ras',
    questionHindi: 'राजस्थान राज्य मानवाधिकार आयोग (RSHRC) के अध्यक्ष की नियुक्ति किसके द्वारा की जाती है?',
    questionEnglish: 'The Chairperson of the Rajasthan State Human Rights Commission (RSHRC) is appointed by:',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'मुख्यमंत्री द्वारा सीधे', textEnglish: 'Chief Minister directly' },
      { id: 'B', textHindi: 'राज्यपाल द्वारा एक उच्चस्तरीय समिति की सिफारिश पर', textEnglish: 'Governor on recommendation of a high-level committee' },
      { id: 'C', textHindi: 'उच्च न्यायालय के मुख्य न्यायाधीश द्वारा', textEnglish: 'Chief Justice of High Court' },
      { id: 'D', textHindi: 'राष्ट्रपति द्वारा', textEnglish: 'President of India' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'मानवाधिकार संरक्षण अधिनियम 1993 के तहत राज्य मानवाधिकार आयोग के अध्यक्ष और सदस्यों की नियुक्ति राज्यपाल द्वारा मुख्यमंत्री की अध्यक्षता वाली समिति (जिसमें गृह मंत्री, विधानसभा अध्यक्ष और विपक्ष के नेता शामिल होते हैं) की सिफारिश पर की जाती है।',
    explanationEnglish: 'Under the Protection of Human Rights Act 1993, the Chairperson is appointed by the Governor on the recommendation of a committee headed by the Chief Minister.',
    difficultyLevel: 'hard',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Polity', 'Constitutional Bodies', 'Administration']
  },

  // Question 6 (REET)
  {
    examSlug: 'reet-level-1-2',
    questionHindi: 'जीन पियाजे (Jean Piaget) के संज्ञानात्मक विकास सिद्धांत के अनुसार बालक में "वस्तु स्थायित्व" (Object Permanence) किस अवस्था में विकसित होता है?',
    questionEnglish: 'According to Jean Piaget\'s cognitive development theory, in which stage does "Object Permanence" develop in a child?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'संवेदी-गामक अवस्था (Sensorimotor Stage)', textEnglish: 'Sensorimotor Stage (0-2 years)' },
      { id: 'B', textHindi: 'पूर्व-संक्रियात्मक अवस्था (Pre-operational Stage)', textEnglish: 'Pre-operational Stage (2-7 years)' },
      { id: 'C', textHindi: 'मूर्त संक्रियात्मक अवस्था (Concrete Operational Stage)', textEnglish: 'Concrete Operational Stage (7-11 years)' },
      { id: 'D', textHindi: 'औपचारिक संक्रियात्मक अवस्था (Formal Operational Stage)', textEnglish: 'Formal Operational Stage (11+ years)' }
    ],
    correctAnswer: 'A',
    explanationHindi: 'संवेदी-गामक अवस्था (0 से 2 वर्ष) के उत्तरार्ध (लगभग 8-12 माह) में बालक यह समझने लगता है कि वस्तुएं दृश्य से ओझल होने पर भी अपना अस्तित्व रखती हैं (वस्तु स्थायित्व)।',
    explanationEnglish: 'During the later phase of the Sensorimotor stage (around 8–12 months), infants grasp that objects continue to exist even when not perceptible.',
    difficultyLevel: 'medium',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['CDP', 'Piaget', 'Child Psychology']
  },

  // Question 7 (Police SI - Hindi)
  {
    examSlug: 'rajasthan-police-si',
    questionHindi: '"सच्चिदानंद" शब्द का सही संधि-विच्छेद क्या होगा?',
    questionEnglish: 'What is the correct Sandhi-Vichhed (etymology split) of the word "Sacchidanand"?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'सच्चि + दानंद', textEnglish: 'Sacchi + Danand' },
      { id: 'B', textHindi: 'सत् + चित् + आनंद', textEnglish: 'Sat + Chit + Anand' },
      { id: 'C', textHindi: 'सद् + चित + आनंद', textEnglish: 'Sad + Chit + Anand' },
      { id: 'D', textHindi: 'सच्च + इदानंद', textEnglish: 'Sacch + Idanand' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'सत् + चित् + आनंद = सच्चिदानंद। यह व्यंजन संधि का प्रसिद्ध उदाहरण है (त् के बाद च् आने पर त् का च् होना, और चित् + आनंद में त् का द् होना)।',
    explanationEnglish: 'Sat + Chit + Anand = Sacchidanand (Classical example of Vyanjan Sandhi in Hindi grammar).',
    difficultyLevel: 'medium',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['Hindi Grammar', 'Sandhi', 'Paper-I']
  },

  // Question 8 (CET)
  {
    examSlug: 'rsmssb-cet-graduation-level',
    questionHindi: 'राजस्थान में 1857 की क्रांति का प्रथम विद्रोह किस सैनिक छावनी से प्रारंभ हुआ था?',
    questionEnglish: 'From which military cantonment did the 1857 Revolt in Rajasthan break out first?',
    questionType: 'single_choice',
    options: [
      { id: 'A', textHindi: 'नीमच छावनी', textEnglish: 'Neemuch Cantonment' },
      { id: 'B', textHindi: 'नसीराबाद छावनी (28 मई 1857)', textEnglish: 'Naseerabad Cantonment (28 May 1857)' },
      { id: 'C', textHindi: 'एरिनपुरा छावनी', textEnglish: 'Erinpura Cantonment' },
      { id: 'D', textHindi: 'ब्यावर छावनी', textEnglish: 'Beawar Cantonment' }
    ],
    correctAnswer: 'B',
    explanationHindi: 'राजस्थान में 1857 की क्रांति का शंखनाद 28 मई 1857 को नसीराबाद (अजमेर) छावनी से 15वीं बंगाल नेटिव इन्फैंट्री के सैनिकों द्वारा किया गया था।',
    explanationEnglish: 'The 1857 Revolt erupted in Rajasthan on 28 May 1857 at Naseerabad Cantonment by the soldiers of the 15th Bengal Native Infantry.',
    difficultyLevel: 'easy',
    marks: 2.0,
    negativeMarks: 0.66,
    tags: ['1857 Revolt', 'Rajasthan History', 'CET GK']
  }
];

const MOCK_TESTS_DATA = [
  {
    examSlug: 'rpsc-ras',
    title: 'RPSC RAS Prelims 2026: General Knowledge & General Science Full Mock #1',
    slug: 'rpsc-ras-prelims-2026-full-mock-01',
    testType: 'full_length',
    durationMinutes: 180,
    totalQuestions: 5,
    totalMarks: 10.0,
    passingMarks: 4.0,
    negativeMarking: 0.66,
    isFree: true,
    instructions: 'This mock test strictly follows the RPSC RAS Preliminary Examination pattern with 1/3rd negative marking for each incorrect response. Time management is crucial.',
    questionFilters: { examSlug: 'rpsc-ras' }
  },
  {
    examSlug: 'reet-level-1-2',
    title: 'REET 2026: Child Development & Pedagogy (CDP) Chapter-Wise Speed Quiz',
    slug: 'reet-2026-cdp-speed-quiz',
    testType: 'sectional',
    durationMinutes: 30,
    totalQuestions: 1,
    totalMarks: 2.0,
    passingMarks: 1.0,
    negativeMarking: 0.0,
    isFree: true,
    instructions: 'Comprehensive practice quiz for REET Level 1 & Level 2 aspirants covering cognitive theories and pedagogy principles.',
    questionFilters: { examSlug: 'reet-level-1-2' }
  },
  {
    examSlug: 'rajasthan-police-si',
    title: 'Rajasthan Police SI 2026: Paper-I General Hindi Grammar Mock Series',
    slug: 'rajasthan-police-si-general-hindi-mock',
    testType: 'sectional',
    durationMinutes: 60,
    totalQuestions: 1,
    totalMarks: 2.0,
    passingMarks: 1.0,
    negativeMarking: 0.66,
    isFree: true,
    instructions: 'High-scoring Hindi Paper-I test for Rajasthan Police Sub-Inspector with negative marking evaluation.',
    questionFilters: { examSlug: 'rajasthan-police-si' }
  },
  {
    examSlug: 'rsmssb-cet-graduation-level',
    title: 'RSMSSB CET (Graduation Level) 2026: Rajasthan History & Culture Speed Test',
    slug: 'rsmssb-cet-rajasthan-history-mock',
    testType: 'topic_wise',
    durationMinutes: 45,
    totalQuestions: 1,
    totalMarks: 2.0,
    passingMarks: 1.0,
    negativeMarking: 0.66,
    isFree: true,
    instructions: 'Practice questions tailored to the latest RSMSSB Common Eligibility Test syllabus.',
    questionFilters: { examSlug: 'rsmssb-cet-graduation-level' }
  }
];

async function seedMockTests() {
  try {
    console.log('📝 Seeding authentic Rajasthan questions and mock test series...');

    // 1. Map exams by slug
    const exams = await Exam.findAll();
    const examMap = {};
    exams.forEach(e => {
      examMap[e.slug] = e.id;
    });

    // 2. Insert Questions
    const createdQuestions = [];
    for (const q of QUESTIONS_DATA) {
      const examId = examMap[q.examSlug];
      if (!examId) continue;

      const [question, created] = await Question.findOrCreate({
        where: {
          examId,
          questionHindi: q.questionHindi
        },
        defaults: {
          ...q,
          examId
        }
      });
      createdQuestions.push({ question, examSlug: q.examSlug });
    }
    console.log(`   + Created/Verified ${createdQuestions.length} bilingual questions.`);

    // 3. Insert Mock Tests & Map TestQuestions
    for (const testData of MOCK_TESTS_DATA) {
      const examId = examMap[testData.examSlug];
      if (!examId) continue;

      const [mockTest, created] = await MockTest.findOrCreate({
        where: { slug: testData.slug },
        defaults: {
          ...testData,
          examId,
          status: 'published'
        }
      });

      console.log(`   + Mock Test: ${mockTest.title} (ID: ${mockTest.id})`);

      // Find matching questions for this exam
      const matchingQuestions = createdQuestions.filter(
        cq => cq.examSlug === testData.examSlug
      );

      let order = 1;
      for (const { question } of matchingQuestions) {
        await TestQuestion.findOrCreate({
          where: {
            mockTestId: mockTest.id,
            questionId: question.id
          },
          defaults: {
            mockTestId: mockTest.id,
            questionId: question.id,
            sectionName: 'General Section',
            questionOrder: order++,
            marks: question.marks || 2.0,
            negativeMarks: question.negativeMarks || 0.66
          }
        });
      }

      // Update question count
      const totalQ = await TestQuestion.count({ where: { mockTestId: mockTest.id } });
      await mockTest.update({ totalQuestions: totalQ });
    }

    console.log('✅ Mock tests and questions seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding mock tests:', err);
  }
}

module.exports = { seedMockTests };

if (require.main === module) {
  sequelize.authenticate()
    .then(() => seedMockTests())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
