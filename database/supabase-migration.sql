-- Supabase PostgreSQL Migration Script
-- Execute this SQL in your Supabase SQL Editor to set up the complete database schema

-- Usuario table
CREATE TABLE IF NOT EXISTS usuario (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  cargo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ProfessorCoordenador table
CREATE TABLE IF NOT EXISTS professor_coordenador (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  curso TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materia table
CREATE TABLE IF NOT EXISTS materia (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MateriaProfessor table
CREATE TABLE IF NOT EXISTS materia_professor (
  id BIGSERIAL PRIMARY KEY,
  professor_id BIGINT NOT NULL,
  materia_id BIGINT NOT NULL,
  tipo_coordenacao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES professor_coordenador(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materia(id) ON DELETE CASCADE,
  UNIQUE (professor_id, materia_id, tipo_coordenacao)
);

-- Evento table
CREATE TABLE IF NOT EXISTS evento (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL,
  local TEXT,
  curso TEXT NOT NULL,
  tipo_evento TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  documento TEXT,
  link TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OdsEvento table
CREATE TABLE IF NOT EXISTS ods_evento (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT NOT NULL,
  ods_numero INTEGER NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE,
  UNIQUE (evento_id, ods_numero)
);

-- AnexoEvento table
CREATE TABLE IF NOT EXISTS anexo_evento (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT NOT NULL,
  nome TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE
);

-- ComentarioEvento table
CREATE TABLE IF NOT EXISTS comentario_evento (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT NOT NULL,
  usuario_id BIGINT,
  autor TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- ProjetoPesquisa table
CREATE TABLE IF NOT EXISTS projeto_pesquisa (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  area_tematica TEXT NOT NULL,
  descricao TEXT NOT NULL,
  momento_ocorre TIMESTAMP WITH TIME ZONE NOT NULL,
  problema_pesquisa TEXT NOT NULL,
  metodologia TEXT NOT NULL,
  resultados_esperados TEXT NOT NULL,
  imagem TEXT,
  professor_coordenador_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_coordenador_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- ProjetoExtensao table
CREATE TABLE IF NOT EXISTS projeto_extensao (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  area_tematica TEXT NOT NULL,
  descricao TEXT NOT NULL,
  momento_ocorre TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_pessoas_procuram TEXT NOT NULL,
  comunidade_envolvida TEXT NOT NULL,
  imagem TEXT,
  professor_coordenador_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_coordenador_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- MateriaProjetoPesquisa table
CREATE TABLE IF NOT EXISTS materia_projeto_pesquisa (
  id BIGSERIAL PRIMARY KEY,
  materia_id BIGINT NOT NULL,
  projeto_pesquisa_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materia(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_pesquisa_id) REFERENCES projeto_pesquisa(id) ON DELETE CASCADE,
  UNIQUE (materia_id, projeto_pesquisa_id)
);

-- MateriaProjetoExtensao table
CREATE TABLE IF NOT EXISTS materia_projeto_extensao (
  id BIGSERIAL PRIMARY KEY,
  materia_id BIGINT NOT NULL,
  projeto_extensao_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materia(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_extensao_id) REFERENCES projeto_extensao(id) ON DELETE CASCADE,
  UNIQUE (materia_id, projeto_extensao_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_evento_data ON evento(data);
CREATE INDEX IF NOT EXISTS idx_evento_responsavel ON evento(responsavel);
CREATE INDEX IF NOT EXISTS idx_comentario_evento ON comentario_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_comentario_usuario ON comentario_evento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ods_evento ON ods_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_anexo_evento ON anexo_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_professor_coordenador_email ON professor_coordenador(email);
CREATE INDEX IF NOT EXISTS idx_materia_nome ON materia(nome);
CREATE INDEX IF NOT EXISTS idx_materia_professor ON materia_professor(professor_id);
CREATE INDEX IF NOT EXISTS idx_materia_materia ON materia_professor(materia_id);
