import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Parser JSON
app.use(express.json());

// Rotas
app.use('/api', router);

// Handler de erros
app.use(errorHandler);

export { app };
