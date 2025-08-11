import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static frontend files from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(rootDir));

// Root route -> index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

app.post('/api/chat', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' });
      return;
    }

    const { messages, model = 'openai/gpt-4o-mini' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array required' });
      return;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://local.app',
        'X-Title': 'AntiPhish Assistant'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      })
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      res.status(502).send(text || 'Upstream error');
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.body.on('data', chunk => {
      res.write(chunk);
    });
    response.body.on('end', () => res.end());
    response.body.on('error', err => {
      console.error(err);
      res.end();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));