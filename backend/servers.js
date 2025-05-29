require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');



const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
    res.send('🎓 Welcome to Student Registration API');
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);



const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
