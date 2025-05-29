const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
