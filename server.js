const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/color_theory', (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  const pythonProcess = spawn('python', ['color_theory.py']);
  let outputData = '';

  pythonProcess.stdin.write(image);
  pythonProcess.stdin.end();

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Script Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({ result: outputData.trim() });
    } else {
      res.status(500).json({ error: 'Python script error' });
    }
  });
});

app.post('/mistralapi', (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }

  const pythonProcess = spawn('python', ['mistralapi.py']);
  let outputData = '';

  pythonProcess.stdin.write(input);
  pythonProcess.stdin.end();

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Script Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({ result: outputData.trim() });
    } else {
      res.status(500).json({ error: 'Python script error' });
    }
  });
});

const server = app.listen(7000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

