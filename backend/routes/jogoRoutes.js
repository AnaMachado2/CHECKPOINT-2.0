const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  listarJogos,
  buscarJogo,
  buscarImagemJogo,
  criarJogo,
  atualizarJogo,
  deletarJogo
} = require('../controllers/jogoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Jogo:
 *       type: object
 *       required:
 *         - nm_jogo
 *         - genero
 *         - classificacao
 *       properties:
 *         id_jogo:
 *           type: integer
 *           description: ID do jogo
 *         nm_jogo:
 *           type: string
 *           description: Nome do jogo
 *         img_jogo:
 *           type: string
 *           format: binary
 *           description: Imagem do jogo (bytea)
 *         genero:
 *           type: string
 *           description: Gênero do jogo
 *         classificacao:
 *           type: string
 *           description: Classificação indicativa
 *         dt_jogo:
 *           type: string
 *           format: date
 *           description: Data de lançamento
 *         id_usuario:
 *           type: integer
 *           description: ID do usuário que cadastrou
 *         tem_imagem:
 *           type: boolean
 *           description: Indica se o jogo possui imagem
 *       example:
 *         nm_jogo: The Last of Us Part II
 *         genero: Ação/Aventura
 *         classificacao: 18+
 *         dt_jogo: 2020-06-19
 */

/**
 * @swagger
 * /api/jogos:
 *   get:
 *     summary: Lista todos os jogos
 *     tags: [Jogos]
 *     responses:
 *       200:
 *         description: Lista de jogos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Jogo'
 */
router.get('/', listarJogos);

/**
 * @swagger
 * /api/jogos/{id}:
 *   get:
 *     summary: Busca um jogo por ID
 *     tags: [Jogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do jogo
 *     responses:
 *       200:
 *         description: Jogo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jogo'
 *       404:
 *         description: Jogo não encontrado
 */
router.get('/:id', buscarJogo);

/**
 * @swagger
 * /api/jogos/{id}/imagem:
 *   get:
 *     summary: Busca a imagem de um jogo
 *     tags: [Jogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do jogo
 *     responses:
 *       200:
 *         description: Imagem do jogo
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Jogo ou imagem não encontrada
 */
router.get('/:id/imagem', buscarImagemJogo);

/**
 * @swagger
 * /api/jogos:
 *   post:
 *     summary: Cadastra um novo jogo com imagem (apenas admin)
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nm_jogo
 *               - genero
 *               - classificacao
 *             properties:
 *               nm_jogo:
 *                 type: string
 *                 description: Nome do jogo
 *               genero:
 *                 type: string
 *                 description: Gênero do jogo
 *               classificacao:
 *                 type: string
 *                 description: Classificação indicativa
 *               dt_jogo:
 *                 type: string
 *                 format: date
 *                 description: Data de lançamento
 *               img_jogo:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do jogo (máx 5MB)
 *     responses:
 *       201:
 *         description: Jogo cadastrado com sucesso
 *       403:
 *         description: Acesso negado
 */
router.post('/', verificarToken, verificarAdmin, upload.single('img_jogo'), criarJogo);

/**
 * @swagger
 * /api/jogos/{id}:
 *   put:
 *     summary: Atualiza um jogo (apenas admin)
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do jogo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nm_jogo:
 *                 type: string
 *               genero:
 *                 type: string
 *               classificacao:
 *                 type: string
 *               dt_jogo:
 *                 type: string
 *                 format: date
 *               img_jogo:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem do jogo (máx 5MB)
 *     responses:
 *       200:
 *         description: Jogo atualizado com sucesso
 *       404:
 *         description: Jogo não encontrado
 *       403:
 *         description: Acesso negado
 */
router.put('/:id', verificarToken, verificarAdmin, upload.single('img_jogo'), atualizarJogo);

/**
 * @swagger
 * /api/jogos/{id}:
 *   delete:
 *     summary: Deleta um jogo (apenas admin)
 *     tags: [Jogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do jogo
 *     responses:
 *       200:
 *         description: Jogo deletado com sucesso
 *       404:
 *         description: Jogo não encontrado
 *       403:
 *         description: Acesso negado
 */
router.delete('/:id', verificarToken, verificarAdmin, deletarJogo);

module.exports = router;
