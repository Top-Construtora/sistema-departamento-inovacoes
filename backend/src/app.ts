import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Parser JSON
app.use(express.json());

// Logging de requests
app.use(requestLogger);

// Rotas
app.use('/api', router);

// Handler de erros
app.use(errorHandler);

export { app };
