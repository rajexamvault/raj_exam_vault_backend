require('dotenv').config();
const { Exam, StudyMaterial, sequelize } = require('../../models');
const StorageService = require('../storage');

function generateValidPdfBuffer(title, subject, examName) {
  const streamContent = `BT /F1 18 Tf 50 720 Td (${title.replace(/[()]/g, '')}) Tj ET ` +
    `BT /F1 12 Tf 50 680 Td (Target Exam: ${examName.replace(/[()]/g, '')} | Subject: ${subject.replace(/[()]/g, '')}) Tj ET ` +
    `BT /F1 10 Tf 50 640 Td (Raj Exam Vault - Rajasthan Competitive Exam Repository) Tj ET ` +
    `BT /F1 9 Tf 50 600 Td (This official study material is verified and hosted on Cloudinary Storage.) Tj ET ` +
    `BT /F1 9 Tf 50 580 Td (Covers syllabus guidelines prescribed by RPSC / RSMSSB boards.) Tj ET`;

  const streamLength = Buffer.byteLength(streamContent);
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  return Buffer.from(pdfString);
}

const MATERIALS_TO_SEED = [
  {
    examSlug: 'rpsc-ras',
    title: 'RPSC RAS 2023 Prelims Official Solved Question Paper',
    materialType: 'pyq',
    year: 2023,
    subject: 'General Knowledge & General Science',
    paperType: 'Prelims Official Paper',
    fileName: 'RPSC_RAS_2023_Prelims_Solved_Paper.pdf',
    fileSize: '4.2 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: 'Official RPSC RAS 2023 Preliminary exam paper with verified master answer key, comprehensive question-by-question explanations, and sectional marks breakdown.'
  },
  {
    examSlug: 'rpsc-ras',
    title: 'Rajasthan History, Art & Culture Complete Quick Revision Notes',
    materialType: 'notes',
    year: 2025,
    subject: 'Rajasthan Art & Culture',
    paperType: 'Handwritten Notes',
    fileName: 'Rajasthan_Art_Culture_Quick_Notes.pdf',
    fileSize: '6.8 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: 'Comprehensive high-yield notes covering Rajasthan forts, folk dances, painting schools, dynasties, fairs, and major festivals as per revised RPSC syllabus.'
  },
  {
    examSlug: 'reet-level-1-2',
    title: 'REET 2024 Level-2 Child Development & Pedagogy Master Notes',
    materialType: 'notes',
    year: 2024,
    subject: 'Educational Psychology & Pedagogy',
    paperType: 'Theory & Solved MCQs',
    fileName: 'REET_L2_Child_Development_Pedagogy_Notes.pdf',
    fileSize: '5.1 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: 'Expert-curated notes on Piaget, Vygotsky, Kohlberg theories, inclusive education models, and RTE Act 2009 for REET Level 2 teaching aspirants.'
  },
  {
    examSlug: 'reet-level-1-2',
    title: 'REET Level 1 & Level 2 Official Syllabus & Scheme 2026',
    materialType: 'syllabus_pdf',
    year: 2026,
    subject: 'Comprehensive Syllabus',
    paperType: 'Official Notification Copy',
    fileName: 'REET_2026_Official_Syllabus.pdf',
    fileSize: '2.4 MB',
    isFree: true,
    price: 0,
    hasSolutions: false,
    description: 'Complete official curriculum and weightage breakdown for REET examination 2026 released by Department of School Education Rajasthan.'
  },
  {
    examSlug: 'rajasthan-police-si',
    title: 'Rajasthan Police Sub-Inspector 2021 Paper 1 (General Hindi) Solved',
    materialType: 'pyq',
    year: 2021,
    subject: 'General Hindi',
    paperType: 'Official Question Paper',
    fileName: 'Rajasthan_Police_SI_2021_Hindi_Paper.pdf',
    fileSize: '3.7 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: 'Original question paper with detailed grammatical analysis for Sandhi, Samas, Muhavare, Lokoktiyan, and Shabd Shuddhi for Rajasthan Police SI exam.'
  },
  {
    examSlug: 'rsmssb-cet-graduation-level',
    title: 'RSMSSB CET (Graduation Level) Official Model Question Paper 2024',
    materialType: 'model_paper',
    year: 2024,
    subject: 'Composite Test Paper',
    paperType: 'Model Practice Paper',
    fileName: 'RSMSSB_CET_Graduation_Model_Paper_2024.pdf',
    fileSize: '4.9 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: '150-question mock test matching RSMSSB CET standard difficulty covering Rajasthan Economy, Reasoning, General Science, and Current Affairs.'
  },
  {
    examSlug: 'rajasthan-patwari',
    title: 'Rajasthan Patwari Exam 2021 Previous Year Question Paper with Solutions',
    materialType: 'pyq',
    year: 2021,
    subject: 'General Studies, Maths & Reasoning',
    paperType: 'Official Solved Paper',
    fileName: 'Rajasthan_Patwari_2021_Solved_Paper.pdf',
    fileSize: '4.5 MB',
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: 'Complete 150 questions paper with step-by-step mathematical reasoning solutions and Rajasthan Land Revenue GK coverage.'
  }
];

async function seedStudyMaterials() {
  try {
    console.log('🌱 Starting Cloudinary Study Materials Seeder for Raj Exam Vault...');
    console.log(`📦 Active Storage Provider: ${StorageService.getProviderName()}`);

    for (const item of MATERIALS_TO_SEED) {
      // Find matching exam
      const exam = await Exam.findOne({ where: { slug: item.examSlug } });
      if (!exam) {
        console.warn(`⚠️ Exam with slug "${item.examSlug}" not found, skipping: ${item.title}`);
        continue;
      }

      // Check if material already exists
      const existing = await StudyMaterial.findOne({
        where: { examId: exam.id, title: item.title }
      });

      if (existing) {
        console.log(`ℹ️ Material already exists: "${item.title}" -> ${existing.fileUrl}`);
        continue;
      }

      console.log(`📤 Uploading PDF to Cloudinary: "${item.fileName}"...`);
      const pdfBuffer = generateValidPdfBuffer(item.title, item.subject, exam.title);

      const fakeFile = {
        buffer: pdfBuffer,
        originalname: item.fileName,
        mimetype: 'application/pdf'
      };

      const uploadResult = await StorageService.uploadFile(fakeFile, 'study_materials');
      console.log(`   ✅ Cloudinary Uploaded! URL: ${uploadResult.url}`);

      const newMaterial = await StudyMaterial.create({
        examId: exam.id,
        title: item.title,
        materialType: item.materialType,
        year: item.year,
        subject: item.subject,
        paperType: item.paperType,
        fileUrl: uploadResult.url,
        fileSize: item.fileSize,
        fileType: 'pdf',
        storageProvider: uploadResult.provider || 'cloudinary',
        totalDownloads: Math.floor(Math.random() * 400) + 120,
        viewCount: Math.floor(Math.random() * 900) + 350,
        isFree: item.isFree,
        price: item.price,
        hasSolutions: item.hasSolutions,
        description: item.description,
        status: 'published'
      });

      console.log(`   📄 Seeded DB Record ID: ${newMaterial.id} ("${newMaterial.title}")`);
    }

    console.log('🎉 Study materials seeded successfully with live Cloudinary storage links!');
  } catch (err) {
    console.error('❌ Seeder error:', err);
  }
}

module.exports = { seedStudyMaterials };

if (require.main === module) {
  sequelize.authenticate()
    .then(() => seedStudyMaterials())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
