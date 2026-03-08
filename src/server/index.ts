import express from 'express';
import cors from 'cors';
import path from 'path';
import { healthRouter } from './routes/health.js';

const app = express();
const PORT = 8080;

// Middlewares base
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Rutas de API
app.use('/api', healthRouter);

// Servir Frontend en producción
app.use(express.static(path.join(process.cwd(), 'src/main/resources/static')));
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src/main/resources/static/index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🗺️  Chronos Atlas - Servidor local iniciado`);
    console.log(`📡 API disponible en:  http://localhost:${PORT}/api`);
    console.log(`🌐 UI disponible en:   http://localhost:3000 (modo dev)\n`);
});
