const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'messages.json');

app.use(cors());
app.use(bodyParser.json());

// Load messages from file, or start with empty array
let messages = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    messages = JSON.parse(data);
  } catch (err) {
    console.error('Error reading messages file:', err);
    messages = [];
  }
}

function saveMessagesToFile() {
  fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (err) => {
    if (err) console.error('Error saving messages:', err);
  });
}

app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newMessage = { name, email, phone, message, receivedAt: new Date() };
  messages.push(newMessage);
  saveMessagesToFile();

  console.log('Stored message:', newMessage);
  res.status(200).json({ message: 'Message received successfully!' });
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.get('/', (req, res) => {
  res.send('Welcome to the Contact Form Backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
