const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  listarListas,
  buscarLista,
  buscarListasPorUsuario,
  criarLista,
  atualizarLista,
  adicionarJogoNaLista,
  removerJogoDaLista,
  deletarLista
} = require('../controllers/listaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Lista:
 *       type: object
 *       required:
 *         - nm_lista
 *         - lista_jogos
 *       properties:
 *         id_lista:
 *           type: integer
 *           description: ID da lista
 *         nm_lista:
 *           type: string
 *           description: Nome da lista
 *         id_usuario:
 *           type: integer
 *           description: ID do usuário dono da lista
 *         lista_jogos:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array de IDs dos jogos na lista
 *         nm_usuario:
 *           type: string
 *           description: Nome do usuário
 *         total_jogos:
 *           type: integer
 *           description: Total de jogos na lista
 *       example:
 *         nm_lista: Meus Favoritos de 2024
 *         lista_jogos: [1, 3, 5, 7]
 */

/**
 * @swagger
 * /api/listas:
 *   get:
 *     summary: Lista todas as listas de jogos
 *     tags: [Listas]
 *     responses:
 *       200:
 *         description: Lista de todas as listas com informações resumidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lista'
 */
router.get('/', listarListas);

/**
 * @swagger
 * /api/listas/{id}:
 *   get:
 *     summary: Busca uma lista específica com detalhes dos jogos
 *     tags: [Listas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da lista
 *     responses:
 *       200:
 *         description: Lista encontrada com informações completas dos jogos
 *       404:
 *         description: Lista não encontrada
 */
router.get('/:id', buscarLista);

/**
 * @swagger
 * /api/listas/usuario/{id_usuario}:
 *   get:
 *     summary: Busca todas as listas de um usuário específico
 *     tags: [Listas]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Listas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lista'
 */
router.get('/usuario/:id_usuario', buscarListasPorUsuario);

/**
 * @swagger
 * /api/listas:
 *   post:
 *     summary: Cria uma nova lista de jogos (usuários autenticados)
 *     tags: [Listas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nm_lista
 *               - lista_jogos
 *             properties:
 *               nm_lista:
 *                 type: string
 *                 description: Nome da lista
 *               lista_jogos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs dos jogos
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Lista criada com sucesso
 *       400:
 *         description: Dados inválidos ou jogos não existem
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.post('/', verificarToken, criarLista);

/**
 * @swagger
 * /api/listas/{id}:
 *   put:
 *     summary: Atualiza uma lista completa (própria lista ou admin)
 *     tags: [Listas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nm_lista:
 *                 type: string
 *                 description: Novo nome da lista
 *               lista_jogos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Novo array de IDs dos jogos
 *     responses:
 *       200:
 *         description: Lista atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissão para editar esta lista
 *       404:
 *         description: Lista não encontrada
 */
router.put('/:id', verificarToken, atualizarLista);

/**
 * @swagger
 * /api/listas/{id}/jogos:
 *   post:
 *     summary: Adiciona um jogo a uma lista existente
 *     tags: [Listas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_jogo
 *             properties:
 *               id_jogo:
 *                 type: integer
 *                 description: ID do jogo a ser adicionado
 *     responses:
 *       200:
 *         description: Jogo adicionado à lista com sucesso
 *       400:
 *         description: Jogo já está na lista
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Lista ou jogo não encontrado
 */
router.post('/:id/jogos', verificarToken, adicionarJogoNaLista);

/**
 * @swagger
 * /api/listas/{id}/jogos/{id_jogo}:
 *   delete:
 *     summary: Remove um jogo de uma lista
 *     tags: [Listas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da lista
 *       - in: path
 *         name: id_jogo
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do jogo a ser removido
 *     responses:
 *       200:
 *         description: Jogo removido da lista com sucesso
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Lista não encontrada
 */
router.delete('/:id/jogos/:id_jogo', verificarToken, removerJogoDaLista);

/**
 * @swagger
 * /api/listas/{id}:
 *   delete:
 *     summary: Deleta uma lista (própria lista ou admin)
 *     tags: [Listas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da lista
 *     responses:
 *       200:
 *         description: Lista deletada com sucesso
 *       403:
 *         description: Sem permissão para deletar esta lista
 *       404:
 *         description: Lista não encontrada
 */
router.delete('/:id', verificarToken, deletarLista);

module.exports = router;
