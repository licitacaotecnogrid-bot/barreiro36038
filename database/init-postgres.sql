-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "Usuario" (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  cargo TEXT NOT NULL,
  "criadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Professores Coordenadores
CREATE TABLE IF NOT EXISTS "ProfessorCoordenador" (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  curso TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS "Evento" (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  data TIMESTAMP NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT DEFAULT 'Pendente',
  local TEXT,
  curso TEXT,
  "tipoEvento" TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  documento TEXT,
  link TEXT,
  "criadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ODS Associadas aos Eventos
CREATE TABLE IF NOT EXISTS "OdsEvento" (
  id SERIAL PRIMARY KEY,
  "eventoId" INTEGER NOT NULL,
  "odsNumero" INTEGER NOT NULL,
  "criadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("eventoId", "odsNumero"),
  FOREIGN KEY ("eventoId") REFERENCES "Evento"(id) ON DELETE CASCADE
);

-- Tabela de Anexos de Eventos
CREATE TABLE IF NOT EXISTS "AnexoEvento" (
  id SERIAL PRIMARY KEY,
  "eventoId" INTEGER NOT NULL,
  nome TEXT NOT NULL,
  "criadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("eventoId") REFERENCES "Evento"(id) ON DELETE CASCADE
);

-- Tabela de Comentários de Eventos
CREATE TABLE IF NOT EXISTS "ComentarioEvento" (
  id SERIAL PRIMARY KEY,
  "eventoId" INTEGER NOT NULL,
  "usuarioId" INTEGER,
  autor TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  "criadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("eventoId") REFERENCES "Evento"(id) ON DELETE CASCADE,
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"(id) ON DELETE SET NULL
);

-- Tabela de Projetos de Pesquisa
CREATE TABLE IF NOT EXISTS "ProjetoPesquisa" (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  "areaTematica" TEXT NOT NULL,
  descricao TEXT NOT NULL,
  "momentoOcorre" TIMESTAMP NOT NULL,
  "problemaPesquisa" TEXT NOT NULL,
  metodologia TEXT NOT NULL,
  "resultadosEsperados" TEXT NOT NULL,
  imagem TEXT,
  "professorCoordenadorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("professorCoordenadorId") REFERENCES "Usuario"(id) ON DELETE CASCADE
);

-- Tabela de Projetos de Extensão
CREATE TABLE IF NOT EXISTS "ProjetoExtensao" (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  "areaTematica" TEXT NOT NULL,
  descricao TEXT NOT NULL,
  "momentoOcorre" TIMESTAMP NOT NULL,
  "tipoPessoasProcuram" TEXT NOT NULL,
  "comunidadeEnvolvida" TEXT NOT NULL,
  imagem TEXT,
  "professorCoordenadorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("professorCoordenadorId") REFERENCES "Usuario"(id) ON DELETE CASCADE
);

-- Tabela de Matérias
CREATE TABLE IF NOT EXISTS "Materia" (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Associação Materia-Professor
CREATE TABLE IF NOT EXISTS "MateriaProfessor" (
  id SERIAL PRIMARY KEY,
  "professorId" INTEGER NOT NULL,
  "materiaId" INTEGER NOT NULL,
  "tipoCoordenacao" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("professorId", "materiaId", "tipoCoordenacao"),
  FOREIGN KEY ("professorId") REFERENCES "ProfessorCoordenador"(id) ON DELETE CASCADE,
  FOREIGN KEY ("materiaId") REFERENCES "Materia"(id) ON DELETE CASCADE
);

-- Tabela de Associação Materia-ProjetoPesquisa
CREATE TABLE IF NOT EXISTS "MateriaProjetoPesquisa" (
  id SERIAL PRIMARY KEY,
  "materiaId" INTEGER NOT NULL,
  "projetoPesquisaId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("materiaId", "projetoPesquisaId"),
  FOREIGN KEY ("materiaId") REFERENCES "Materia"(id) ON DELETE CASCADE,
  FOREIGN KEY ("projetoPesquisaId") REFERENCES "ProjetoPesquisa"(id) ON DELETE CASCADE
);

-- Tabela de Associação Materia-ProjetoExtensao
CREATE TABLE IF NOT EXISTS "MateriaProjetoExtensao" (
  id SERIAL PRIMARY KEY,
  "materiaId" INTEGER NOT NULL,
  "projetoExtensaoId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("materiaId", "projetoExtensaoId"),
  FOREIGN KEY ("materiaId") REFERENCES "Materia"(id) ON DELETE CASCADE,
  FOREIGN KEY ("projetoExtensaoId") REFERENCES "ProjetoExtensao"(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_evento_data ON "Evento"(data);
CREATE INDEX IF NOT EXISTS idx_projetoPesquisa_profesor ON "ProjetoPesquisa"("professorCoordenadorId");
CREATE INDEX IF NOT EXISTS idx_projetoExtensao_profesor ON "ProjetoExtensao"("professorCoordenadorId");
CREATE INDEX IF NOT EXISTS idx_materia_professor_materia ON "MateriaProfessor"("materiaId");
CREATE INDEX IF NOT EXISTS idx_materia_pesquisa_materia ON "MateriaProjetoPesquisa"("materiaId");
CREATE INDEX IF NOT EXISTS idx_materia_extensao_materia ON "MateriaProjetoExtensao"("materiaId");
CREATE INDEX IF NOT EXISTS idx_comentario_evento ON "ComentarioEvento"("eventoId");
CREATE INDEX IF NOT EXISTS idx_ods_evento ON "OdsEvento"("eventoId");
