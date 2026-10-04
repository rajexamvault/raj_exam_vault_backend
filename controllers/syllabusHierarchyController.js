const syllabusHierarchyService = require('../services/syllabusHierarchyService');

// Full hierarchy tree
const getExamHierarchy = async (req, res) => {
  try {
    const { examId } = req.params ?? {};
    console.log('GET /syllabus/tree/:examId called with param:', examId);
    const hierarchy = await syllabusHierarchyService.getExamHierarchy(examId);
    console.log('Hierarchy stages found:', hierarchy?.stages?.length ?? 0);
    return res.status(200).json({
      success: true,
      data: hierarchy
    });
  } catch (err) {
    console.error('getExamHierarchy error:', err);
    return res.status(err.message === 'Exam not found' ? 404 : 500).json({
      success: false,
      message: err.message ?? 'Failed to retrieve exam hierarchy'
    });
  }
};

// Stages
const getStages = async (req, res) => {
  try {
    const { examId } = req.params ?? {};
    const stages = await syllabusHierarchyService.getStagesByExam(examId);
    return res.status(200).json({ success: true, data: stages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message ?? 'Failed to get stages' });
  }
};

const createStage = async (req, res) => {
  try {
    const { examId } = req.params ?? {};
    const stage = await syllabusHierarchyService.createStage(examId, req.body ?? {});
    return res.status(201).json({
      success: true,
      message: 'Exam stage created successfully',
      data: stage
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to create stage' });
  }
};

const updateStage = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const stage = await syllabusHierarchyService.updateStage(id, req.body ?? {});
    return res.status(200).json({
      success: true,
      message: 'Exam stage updated successfully',
      data: stage
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to update stage' });
  }
};

const deleteStage = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await syllabusHierarchyService.deleteStage(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to delete stage' });
  }
};

// Subjects
const getSubjects = async (req, res) => {
  try {
    const { stageId } = req.params ?? {};
    const subjects = await syllabusHierarchyService.getSubjectsByStage(stageId);
    return res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message ?? 'Failed to get subjects' });
  }
};

const getSubjectsByExam = async (req, res) => {
  try {
    const { examId } = req.params ?? {};
    const subjects = await syllabusHierarchyService.getSubjectsByExam(examId);
    return res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message ?? 'Failed to get exam subjects' });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await syllabusHierarchyService.createSubject(req.body ?? {});
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to create subject' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const subject = await syllabusHierarchyService.updateSubject(id, req.body ?? {});
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to update subject' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await syllabusHierarchyService.deleteSubject(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to delete subject' });
  }
};

// Topics
const getTopics = async (req, res) => {
  try {
    const { subjectId } = req.params ?? {};
    const topics = await syllabusHierarchyService.getTopicsBySubject(subjectId);
    return res.status(200).json({ success: true, data: topics });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message ?? 'Failed to get topics' });
  }
};

const createTopic = async (req, res) => {
  try {
    const topic = await syllabusHierarchyService.createTopic(req.body ?? {});
    return res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to create topic' });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const topic = await syllabusHierarchyService.updateTopic(id, req.body ?? {});
    return res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to update topic' });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await syllabusHierarchyService.deleteTopic(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to delete topic' });
  }
};

// Syllabus Items
const getSyllabusItems = async (req, res) => {
  try {
    const items = await syllabusHierarchyService.getSyllabusItems(req.query ?? {});
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message ?? 'Failed to get syllabus items' });
  }
};

const createSyllabusItem = async (req, res) => {
  try {
    const item = await syllabusHierarchyService.createSyllabusItem(req.body ?? {});
    return res.status(201).json({
      success: true,
      message: 'Syllabus item created successfully',
      data: item
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to create syllabus item' });
  }
};

const updateSyllabusItem = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const item = await syllabusHierarchyService.updateSyllabusItem(id, req.body ?? {});
    return res.status(200).json({
      success: true,
      message: 'Syllabus item updated successfully',
      data: item
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to update syllabus item' });
  }
};

const deleteSyllabusItem = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await syllabusHierarchyService.deleteSyllabusItem(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to delete syllabus item' });
  }
};

// Reorder
const reorder = async (req, res) => {
  try {
    const { type, orderedIds } = req.body ?? {};
    const result = await syllabusHierarchyService.reorderEntities(type, orderedIds);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message ?? 'Failed to reorder' });
  }
};

const syllabusHierarchyController = {
  getExamHierarchy,
  getStages,
  createStage,
  updateStage,
  deleteStage,
  getSubjects,
  getSubjectsByExam,
  createSubject,
  updateSubject,
  deleteSubject,
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getSyllabusItems,
  createSyllabusItem,
  updateSyllabusItem,
  deleteSyllabusItem,
  reorder
};

module.exports = syllabusHierarchyController;
module.exports.getExamHierarchy = getExamHierarchy;
module.exports.getStages = getStages;
module.exports.createStage = createStage;
module.exports.updateStage = updateStage;
module.exports.deleteStage = deleteStage;
module.exports.getSubjects = getSubjects;
module.exports.getSubjectsByExam = getSubjectsByExam;
module.exports.createSubject = createSubject;
module.exports.updateSubject = updateSubject;
module.exports.deleteSubject = deleteSubject;
module.exports.getTopics = getTopics;
module.exports.createTopic = createTopic;
module.exports.updateTopic = updateTopic;
module.exports.deleteTopic = deleteTopic;
module.exports.getSyllabusItems = getSyllabusItems;
module.exports.createSyllabusItem = createSyllabusItem;
module.exports.updateSyllabusItem = updateSyllabusItem;
module.exports.deleteSyllabusItem = deleteSyllabusItem;
module.exports.reorder = reorder;
