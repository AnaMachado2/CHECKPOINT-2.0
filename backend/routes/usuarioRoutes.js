const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const {
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  deletarUsuario
} = require('../controllers/usuarioController');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários (apenas admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get('/', verificarToken, verificarAdmin, listarUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', verificarToken, buscarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário (próprio perfil ou admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nm_usuario:
 *                 type: string
 *               email_usuario:
 *                 type: string
 *               senha_usuario:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', verificarToken, atualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Deleta um usuário (apenas admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', verificarToken, verificarAdmin, deletarUsuario);

module.exports = router;
