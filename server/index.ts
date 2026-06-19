import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/authRoutes.js';
import { scoreRouter } from './routes/scoreRoutes.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tom0317-wu.github.io',
  ],
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/scores', scoreRouter);

// In local production mode (npm run start), Express serves the Vite build.
// On Vercel, static files are served by Vercel's CDN — no need for this block.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const buildDir = path.join(__dirname, '../build');
  app.use(express.static(buildDir));
  app.get('*', (_, res) => res.sendFile(path.join(buildDir, 'index.html')));
}

// Vercel provides its own HTTP listener — only bind a port for local dev.
if (!process.env.VERCEL) {
  app.listen(3001, () => console.log('Server running on http://localhost:3001'));
}

export default app;
