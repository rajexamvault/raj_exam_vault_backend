const syllabusHierarchyService = require('../services/syllabusHierarchyService');

class SyllabusHierarchyController {
  // Full hierarchy tree
  async getExamHierarchy(req, res) {
    try {
      console.log('GET /syllabus/tree/:examId called with param:', req.params.examId);
      const hierarchy = await syllabusHierarchyService.getExamHierarchy(req.params.examId);
      console.log('Hierarchy stages found:', hierarchy?.stages?.length);
      res.status(200).json({
        success: true,
        data: hierarchy
      });
    } catch (err) {
      console.error('getExamHierarchy error:', err);
      res.status(err.message === 'Exam not found' ? 404 : 500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Stages
  async getStages(req, res) {
    try {
      const stages = await syllabusHierarchyService.getStagesByExam(req.params.examId);
      res.status(200).json({ success: true, data: stages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createStage(req, res) {
    try {
      const stage = await syllabusHierarchyService.createStage(req.params.examId, req.body);
      res.status(201).json({
        success: true,
        message: 'Exam stage created successfully',
        data: stage
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateStage(req, res) {
    try {
      const stage = await syllabusHierarchyService.updateStage(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Exam stage updated successfully',
        data: stage
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteStage(req, res) {
    try {
      const result = await syllabusHierarchyService.deleteStage(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Subjects
  async getSubjects(req, res) {
    try {
      const subjects = await syllabusHierarchyService.getSubjectsByStage(req.params.stageId);
      res.status(200).json({ success: true, data: subjects });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createSubject(req, res) {
    try {
      const subject = await syllabusHierarchyService.createSubject(req.body);
      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateSubject(req, res) {
    try {
      const subject = await syllabusHierarchyService.updateSubject(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: subject
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteSubject(req, res) {
    try {
      const result = await syllabusHierarchyService.deleteSubject(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Topics
  async getTopics(req, res) {
    try {
      const topics = await syllabusHierarchyService.getTopicsBySubject(req.params.subjectId);
      res.status(200).json({ success: true, data: topics });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createTopic(req, res) {
    try {
      const topic = await syllabusHierarchyService.createTopic(req.body);
      res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: topic
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateTopic(req, res) {
    try {
      const topic = await syllabusHierarchyService.updateTopic(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Topic updated successfully',
        data: topic
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteTopic(req, res) {
    try {
      const result = await syllabusHierarchyService.deleteTopic(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Syllabus Items
  async getSyllabusItems(req, res) {
    try {
      const items = await syllabusHierarchyService.getSyllabusItems(req.query);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createSyllabusItem(req, res) {
    try {
      const item = await syllabusHierarchyService.createSyllabusItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Syllabus item created successfully',
        data: item
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateSyllabusItem(req, res) {
    try {
      const item = await syllabusHierarchyService.updateSyllabusItem(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Syllabus item updated successfully',
        data: item
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteSyllabusItem(req, res) {
    try {
      const result = await syllabusHierarchyService.deleteSyllabusItem(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Reorder
  async reorder(req, res) {
    try {
      const { type, orderedIds } = req.body;
      const result = await syllabusHierarchyService.reorderEntities(type, orderedIds);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SyllabusHierarchyController();
