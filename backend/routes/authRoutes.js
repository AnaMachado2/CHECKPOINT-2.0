const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nm_usuario
 *         - email_usuario
 *         - senha_usuario
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: ID do usuário
 *         nm_usuario:
 *           type: string
 *           description: Nome do usuário
 *         email_usuario:
 *           type: string
 *           description: Email do usuário
 *         senha_usuario:
 *           type: string
 *           format: password
 *           description: Senha do usuário
 *         tipo_usuario:
 *           type: string
 *           enum: [user, admin]
 *           description: Tipo de usuário
 *       example:
 *         nm_usuario: João Silva
 *         email_usuario: joao@email.com
 *         senha_usuario: senha123
 */

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nm_usuario
 *               - email_usuario
 *               - senha_usuario
 *             properties:
 *               nm_usuario:
 *                 type: string
 *               email_usuario:
 *                 type: string
 *               senha_usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Email já cadastrado
 *       500:
 *         description: Erro no servidor
 */
router.post('/registrar', registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_usuario
 *               - senha_usuario
 *             properties:
 *               email_usuario:
 *                 type: string
 *               senha_usuario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 token:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro no servidor
 */
router.post('/login', login);

module.exports = router;
