const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

// Register a new student (plain-text password)
exports.register = async (req, res) => {
  try {
    const {
      FirstName, LastName, Password,
      Gender, IDNumber, DateOfBirth, Email, PhoneNumber
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Password', sql.NVarChar, Password)  // plain text
      .input('Gender', sql.NVarChar, Gender)
      .input('IDNumber', sql.NVarChar, IDNumber)
      .input('DateOfBirth', sql.Date, new Date(DateOfBirth))
      .input('Email', sql.NVarChar, Email)
      .input('PhoneNumber', sql.NVarChar, PhoneNumber)
      .query(`
        INSERT INTO StudentRegistration 
        (FirstName, LastName, Password, Gender, IDNumber, DateOfBirth, Email, PhoneNumber)
        VALUES (@FirstName, @LastName, @Password, @Gender, @IDNumber, @DateOfBirth, @Email, @PhoneNumber);
      `);

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send(`Registration failed: ${err.message}`);
  }
};

// Login user and return JWT token
exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.NVarChar, Email)
      .query('SELECT * FROM StudentRegistration WHERE Email = @Email');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Plain text password comparison
    if (Password !== user.Password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.StudentID },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err.stack || err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get profile data based on JWT token
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

// Update profile using JWT
exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');

    const { FirstName, LastName, Email, Password } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('StudentID', sql.Int, decoded.userId)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Email', sql.NVarChar, Email)
      .input('Password', sql.NVarChar, Password)
      .query(`
        UPDATE StudentRegistration
        SET FirstName = @FirstName, LastName = @LastName, Email = @Email, Password = @Password
        WHERE StudentID = @StudentID
      `);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Delete profile using JWT
exports.deleteProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');

    const pool = await poolPromise;
    await pool.request()
      .input('StudentID', sql.Int, decoded.userId)
      .query('DELETE FROM StudentRegistration WHERE StudentID = @StudentID');

    res.json({ message: 'Profile deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
};
