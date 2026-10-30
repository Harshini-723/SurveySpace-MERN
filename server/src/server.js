require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const questionBank = require('./data/questions');
const SurveyResponse = require('./models/SurveyResponse');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('This website origin is not allowed by the API CORS settings.'));
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/questions', (req, res) => {
  const selected = [...questionBank]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((item) => ({ ...item, _id: crypto.randomUUID() }));
  res.json({ questions: selected });
});

app.post('/api/responses', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Check the server MongoDB configuration.' });
    }
    const answers = req.body.answers;
    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: 'Please submit answers to all five questions.' });
    }

    const validAnswers = answers.every((item) =>
      item &&
      typeof item.questionId === 'string' &&
      typeof item.question === 'string' &&
      typeof item.answer === 'string' &&
      item.question.length <= 300 &&
      item.answer.length <= 100
    );
    if (!validAnswers) {
      return res.status(400).json({ message: 'The submitted answers are invalid.' });
    }

    const saved = await SurveyResponse.create({ answers });
    res.status(201).json({ message: 'Survey submitted successfully.', responseId: saved._id });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ message: 'Could not save your response. Please try again.' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || 'Unexpected server error.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Add it to server/.env before starting.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`SurveySpace API listening on port ${PORT}`));
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

start();
