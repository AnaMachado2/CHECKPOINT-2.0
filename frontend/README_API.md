# Checkpoint - Configuração da API

## Configuração do Backend

Este projeto está configurado para se conectar a uma API REST. Para configurar a URL do backend:

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e configure a URL da sua API:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

## Endpoints Implementados

### Autenticação
- `POST /api/auth/registrar` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário

### Jogos
- `GET /api/jogos` - Listar todos os jogos
- `GET /api/jogos/{id}` - Buscar jogo específico
- `GET /api/jogos/{id}/imagem` - Obter imagem do jogo
- `POST /api/jogos` - Criar novo jogo (Admin)
- `PUT /api/jogos/{id}` - Atualizar jogo (Admin)
- `DELETE /api/jogos/{id}` - Deletar jogo (Admin)

### Avaliações
- `GET /api/avaliacoes` - Listar todas as avaliações
- `GET /api/avaliacoes/jogo/{id_jogo}` - Avaliações de um jogo
- `POST /api/avaliacoes` - Criar avaliação
- `PUT /api/avaliacoes/{id}` - Atualizar avaliação
- `DELETE /api/avaliacoes/{id}` - Deletar avaliação

### Listas
- `GET /api/listas` - Listar todas as listas
- `GET /api/listas/{id}` - Buscar lista específica
- `GET /api/listas/usuario/{id_usuario}` - Listas de um usuário
- `POST /api/listas` - Criar nova lista
- `PUT /api/listas/{id}` - Atualizar lista
- `POST /api/listas/{id}/jogos` - Adicionar jogo à lista
- `DELETE /api/listas/{id}/jogos/{id_jogo}` - Remover jogo da lista
- `DELETE /api/listas/{id}` - Deletar lista

### Usuários
- `GET /api/usuarios` - Listar todos usuários (Admin)
- `GET /api/usuarios/{id}` - Buscar usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Deletar usuário (Admin)

## Autenticação

O sistema usa JWT (JSON Web Token) para autenticação. Após o login bem-sucedido:
- O token é armazenado no `localStorage`
- Todas as requisições autenticadas incluem o header: `Authorization: Bearer <token>`
- Em caso de erro 401, o usuário é automaticamente deslogado

## Estrutura de Serviços

Os serviços estão organizados em:
- `src/lib/api.ts` - Configuração base do Axios
- `src/services/auth.ts` - Serviços de autenticação
- `src/services/games.ts` - Serviços de jogos
- `src/services/reviews.ts` - Serviços de avaliações
- `src/services/lists.ts` - Serviços de listas
- `src/services/users.ts` - Serviços de usuários
- `src/hooks/useAuth.tsx` - Context de autenticação

## Desenvolvimento

Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta livre).
