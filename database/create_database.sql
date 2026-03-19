-- public.tab_usuario definição

-- Drop table

-- DROP TABLE public.tab_usuario;

CREATE TABLE public.tab_usuario (
	id_usuario serial4 NOT NULL,
	nm_usuario varchar(100) NULL,
	email_usuario varchar(150) NULL,
	senha_usuario varchar(150) NULL,
	tipo_usuario varchar(5) NULL,
	CONSTRAINT tab_usuario_pk PRIMARY KEY (id_usuario)
);


-- public.tab_comentario definição

-- Drop table

-- DROP TABLE public.tab_comentario;

CREATE TABLE public.tab_comentario (
	id_comentario serial4 NOT NULL,
	comentario text NOT NULL,
	dt_comentario date NULL,
	id_usuario int4 NOT NULL,
	CONSTRAINT tab_comentario_pk PRIMARY KEY (id_comentario),
	CONSTRAINT tab_comentario_tab_usuario FOREIGN KEY (id_usuario) REFERENCES public.tab_usuario(id_usuario)
);


-- public.tab_jogos definição

-- Drop table

-- DROP TABLE public.tab_jogos;

CREATE TABLE public.tab_jogos (
	id_jogo serial4 NOT NULL,
	nm_jogo varchar(150) NULL,
	img_jogo bytea NULL,
	genero varchar(100) NOT NULL,
	classificacao varchar(50) NOT NULL,
	dt_jogo date NULL,
	id_usuario int4 NOT NULL,
	CONSTRAINT tab_jogos_pk PRIMARY KEY (id_jogo),
	CONSTRAINT tab_jogos_tab_usuario FOREIGN KEY (id_usuario) REFERENCES public.tab_usuario(id_usuario)
);


-- public.tab_lista definição

-- Drop table

-- DROP TABLE public.tab_lista;

CREATE TABLE public.tab_lista (
	id_lista serial4 NOT NULL,
	nm_lista varchar(100) NULL,
	id_usuario int4 NOT NULL,
	lista_jogos _int4 NULL,
	CONSTRAINT tab_lista_pk PRIMARY KEY (id_lista),
	CONSTRAINT tab_lista_tab_usuario FOREIGN KEY (id_usuario) REFERENCES public.tab_usuario(id_usuario)
);


-- public.tab_avaliacao definição

-- Drop table

-- DROP TABLE public.tab_avaliacao;

CREATE TABLE public.tab_avaliacao (
	id_avaliacao serial4 NOT NULL,
	nota int4 NULL,
	id_usuario int4 NOT NULL,
	id_comentario int4 NOT NULL,
	id_jogo int4 NOT NULL,
	CONSTRAINT tab_avaliacao_pk PRIMARY KEY (id_avaliacao),
	CONSTRAINT tab_avaliacao_tab_comentario FOREIGN KEY (id_comentario) REFERENCES public.tab_comentario(id_comentario),
	CONSTRAINT tab_avaliacao_tab_jogos FOREIGN KEY (id_jogo) REFERENCES public.tab_jogos(id_jogo),
	CONSTRAINT tab_avaliacao_tab_usuario FOREIGN KEY (id_usuario) REFERENCES public.tab_usuario(id_usuario)
);
