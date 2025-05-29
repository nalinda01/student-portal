const { sql, poolPromise } = require('../db');
const path = require('path');

exports.addCourse = async (req, res) => {
  const { Title, Description } = req.body;
  const ImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Title', sql.NVarChar, Title)
      .input('Description', sql.NVarChar, Description)
      .input('ImagePath', sql.NVarChar, ImagePath)
      .query('INSERT INTO Courses (Title, Description, ImagePath) VALUES (@Title, @Description, @ImagePath)');
    res.status(201).json({ message: 'Course added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding course');
  }
};

exports.getCourses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Courses');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error fetching courses');
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { Title, Description } = req.body;
  const ImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const pool = await poolPromise;
    let query = `
      UPDATE Courses
      SET Title = @Title,
          Description = @Description
          ${ImagePath ? ', ImagePath = @ImagePath' : ''}
      WHERE CourseID = @CourseID
    `;
    const request = pool.request()
      .input('CourseID', sql.Int, id)
      .input('Title', sql.NVarChar, Title)
      .input('Description', sql.NVarChar, Description);
    if (ImagePath) request.input('ImagePath', sql.NVarChar, ImagePath);
    await request.query(query);
    res.send('Course updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating course');
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('CourseID', sql.Int, id)
      .query('DELETE FROM Courses WHERE CourseID = @CourseID');
    res.send('Course deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting course');
  }
};

// controllers/courseController.js

exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('CourseID', sql.Int, id)
      .query('SELECT * FROM Courses WHERE CourseID = @CourseID');

    if (result.recordset.length === 0) {
      return res.status(404).send('Course not found');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching course details');
  }
};
