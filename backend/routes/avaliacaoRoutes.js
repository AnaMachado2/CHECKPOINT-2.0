const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  listarAvaliacoes,
  buscarAvaliacoesPorJogo,
  criarAvaliacao,
  atualizarAvaliacao,
  deletarAvaliacao
} = require('../controllers/avaliacaoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Avaliacao:
 *       type: object
 *       required:
 *         - id_jogo
 *         - id_usuario
 *         - nota
 *         - comentario
 *       properties:
 *         id_avaliacao:
 *           type: integer
 *           description: ID da avaliação
 *         id_jogo:
 *           type: integer
 *           description: ID do jogo avaliado
 *         id_usuario:
 *           type: integer
 *           description: ID do usuário que avaliou
 *         nota:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Nota atribuída ao jogo (0 a 5)
 *         comentario:
 *           type: string
 *           description: Comentário do usuário sobre o jogo
 *         data_avaliacao:
 *           type: string
 *           format: date-time
 *           description: Data e hora da avaliação
 *       example:
 *         id_jogo: 1
 *         id_usuario: 2
 *         nota: 4.5
 *         comentario: Excelente jogabilidade e trilha sonora!
 */

/**
 * @swagger
 * tags:
 *   - name: Avaliações
 *     description: Endpoints para gerenciar as avaliações dos jogos
 */

/**
 * @swagger
 * /api/avaliacoes:
 *   get:
 *     summary: Lista todas as avaliações cadastradas
 *     tags: [Avaliações]
 *     responses:
 *       200:
 *         description: Lista de avaliações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Avaliacao'
 *       500:
 *         description: Erro no servidor
 */
router.get('/', listarAvaliacoes);

/**
 * @swagger
 * /api/avaliacoes/jogo/{id_jogo}:
 *   get:
 *     summary: Busca todas as avaliações de um jogo específico
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id_jogo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do jogo
 *     responses:
 *       200:
 *         description: Avaliações do jogo retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Avaliacao'
 *       404:
 *         description: Nenhuma avaliação encontrada para o jogo
 *       500:
 *         description: Erro no servidor
 */
router.get('/jogo/:id_jogo', buscarAvaliacoesPorJogo);

/**
 * @swagger
 * /api/avaliacoes:
 *   post:
 *     summary: Cria uma nova avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_jogo
 *               - id_usuario
 *               - nota
 *               - comentario
 *             properties:
 *               id_jogo:
 *                 type: integer
 *               id_usuario:
 *                 type: integer
 *               nota:
 *                 type: number
 *                 format: float
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Avaliacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       500:
 *         description: Erro no servidor
 */
router.post('/', verificarToken, criarAvaliacao);

/**
 * @swagger
 * /api/avaliacoes/{id}:
 *   put:
 *     summary: Atualiza uma avaliação existente
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: number
 *                 format: float
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Avaliacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Avaliação não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.put('/:id', verificarToken, atualizarAvaliacao);

/**
 * @swagger
 * /api/avaliacoes/{id}:
 *   delete:
 *     summary: Deleta uma avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação a ser deletada
 *     responses:
 *       200:
 *         description: Avaliação deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Avaliação não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.delete('/:id', verificarToken, deletarAvaliacao);

module.exports = router;
