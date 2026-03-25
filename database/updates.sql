-- Script de atualização do banco de dados para novas funcionalidades

-- 1. Adicionar foto_perfil na tabela tab_usuario
ALTER TABLE public.tab_usuario ADD COLUMN foto_perfil TEXT;

-- 2. Criar a tabela de seguidores
CREATE TABLE public.tab_seguidores (
    id_seguidor INT NOT NULL,
    id_seguido INT NOT NULL,
    data_seguido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tab_seguidores_pk PRIMARY KEY (id_seguidor, id_seguido),
    CONSTRAINT fk_seguidor FOREIGN KEY (id_seguidor) REFERENCES public.tab_usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_seguido FOREIGN KEY (id_seguido) REFERENCES public.tab_usuario(id_usuario) ON DELETE CASCADE
);
