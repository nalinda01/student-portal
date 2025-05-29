const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('Image'), courseController.addCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById); 
router.put('/:id', upload.single('Image'), courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
