import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Chronos Atlas Backend (TypeScript/Express)',
        version: '1.0.0',
    });
});
