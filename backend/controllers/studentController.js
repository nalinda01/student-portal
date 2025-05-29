const { sql, poolPromise } = require('../db');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM StudentRegistration');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error fetching students');
  }
};
// studentController.js



// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('StudentID', sql.Int, studentId)
      .query('SELECT StudentID, FirstName, LastName, Gender, IDNumber, DateOfBirth, Email, PhoneNumber FROM StudentRegistration WHERE StudentID = @StudentID');

    const student = result.recordset[0];
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).send('Error fetching student');
  }
};

// Get one student by ID
// In authController.js or a suitable controller file

exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');

    const pool = await poolPromise;
    const result = await pool.request()
      .input('StudentID', sql.Int, decoded.userId)
      .query('SELECT StudentID, FirstName, LastName, Gender, IDNumber, DateOfBirth, Email, PhoneNumber FROM StudentRegistration WHERE StudentID = @StudentID');

    const student = result.recordset[0];
    if (!student) return res.status(404).json({ message: 'User not found' });

    res.json(student);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};



// Update student by ID
exports.updateStudent = async (req, res) => {
  const studentId = req.params.id;
  const { FirstName, Email, Password } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('StudentID', sql.Int, studentId)
      .input(' FirstName', sql.NVarChar(50),  FirstName)
      .input('Email', sql.NVarChar(50), Email)
      .input('Password', sql.NVarChar(50), Password)
      .query('UPDATE StudentRegistration SET  FirstName = @FirstName, Email = @Email, Password = @Password WHERE StudentID = @StudentID');

    res.send('Student updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating student');
  }
};

// Delete student by ID
exports.deleteStudent = async (req, res) => {
  const studentId = req.params.id;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('StudentID', sql.Int, studentId)
      .query('DELETE FROM StudentRegistration WHERE StudentID = @StudentID');

    res.send('Student deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting student');
  }
};
