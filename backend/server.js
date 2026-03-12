const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const jogoRoutes = require('./routes/jogoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const listaRoutes = require('./routes/listaRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GameLog API',
      version: '1.0.0',
      description: 'API para rede social de jogos - Sistema de avaliações e reviews de games',
      contact: {
        name: 'Suporte GameLog'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/jogos', jogoRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/listas', listaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API GameLog funcionando!',
    documentacao: `http://localhost:${process.env.PORT || 3000}/api-docs`
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
