-- Usuario table
CREATE TABLE IF NOT EXISTS Usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  cargo TEXT NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ProfessorCoordenador table
CREATE TABLE IF NOT EXISTS ProfessorCoordenador (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  curso TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Materia table
CREATE TABLE IF NOT EXISTS Materia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MateriaProfessor table
CREATE TABLE IF NOT EXISTS MateriaProfessor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professorId INTEGER NOT NULL,
  materiaId INTEGER NOT NULL,
  tipoCoordenacao TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorId) REFERENCES ProfessorCoordenador(id) ON DELETE CASCADE,
  FOREIGN KEY (materiaId) REFERENCES Materia(id) ON DELETE CASCADE,
  UNIQUE (professorId, materiaId, tipoCoordenacao)
);

-- Evento table
CREATE TABLE IF NOT EXISTS Evento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  data DATETIME NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL,
  local TEXT,
  curso TEXT NOT NULL,
  tipoEvento TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  documento TEXT,
  link TEXT,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OdsEvento table
CREATE TABLE IF NOT EXISTS OdsEvento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventoId INTEGER NOT NULL,
  odsNumero INTEGER NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventoId) REFERENCES Evento(id) ON DELETE CASCADE,
  UNIQUE (eventoId, odsNumero)
);

-- AnexoEvento table
CREATE TABLE IF NOT EXISTS AnexoEvento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventoId INTEGER NOT NULL,
  nome TEXT NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventoId) REFERENCES Evento(id) ON DELETE CASCADE
);

-- ComentarioEvento table
CREATE TABLE IF NOT EXISTS ComentarioEvento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventoId INTEGER NOT NULL,
  usuarioId INTEGER,
  autor TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventoId) REFERENCES Evento(id) ON DELETE CASCADE,
  FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE SET NULL
);

-- ProjetoPesquisa table
CREATE TABLE IF NOT EXISTS ProjetoPesquisa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  areaTematica TEXT NOT NULL,
  descricao TEXT NOT NULL,
  momentoOcorre DATETIME NOT NULL,
  problemaPesquisa TEXT NOT NULL,
  metodologia TEXT NOT NULL,
  resultadosEsperados TEXT NOT NULL,
  imagem TEXT,
  professorCoordenadorId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorCoordenadorId) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- ProjetoExtensao table
CREATE TABLE IF NOT EXISTS ProjetoExtensao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  areaTematica TEXT NOT NULL,
  descricao TEXT NOT NULL,
  momentoOcorre DATETIME NOT NULL,
  tipoPessoasProcuram TEXT NOT NULL,
  comunidadeEnvolvida TEXT NOT NULL,
  imagem TEXT,
  professorCoordenadorId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorCoordenadorId) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- MateriaProjetoPesquisa table
CREATE TABLE IF NOT EXISTS MateriaProjetoPesquisa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materiaId INTEGER NOT NULL,
  projetoPesquisaId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materiaId) REFERENCES Materia(id) ON DELETE CASCADE,
  FOREIGN KEY (projetoPesquisaId) REFERENCES ProjetoPesquisa(id) ON DELETE CASCADE,
  UNIQUE (materiaId, projetoPesquisaId)
);

-- MateriaProjetoExtensao table
CREATE TABLE IF NOT EXISTS MateriaProjetoExtensao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materiaId INTEGER NOT NULL,
  projetoExtensaoId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materiaId) REFERENCES Materia(id) ON DELETE CASCADE,
  FOREIGN KEY (projetoExtensaoId) REFERENCES ProjetoExtensao(id) ON DELETE CASCADE,
  UNIQUE (materiaId, projetoExtensaoId)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usuario_email ON Usuario(email);
CREATE INDEX IF NOT EXISTS idx_evento_data ON Evento(data);
CREATE INDEX IF NOT EXISTS idx_evento_responsavel ON Evento(responsavel);
CREATE INDEX IF NOT EXISTS idx_comentario_evento ON ComentarioEvento(eventoId);
CREATE INDEX IF NOT EXISTS idx_comentario_usuario ON ComentarioEvento(usuarioId);
CREATE INDEX IF NOT EXISTS idx_ods_evento ON OdsEvento(eventoId);
CREATE INDEX IF NOT EXISTS idx_anexo_evento ON AnexoEvento(eventoId);
CREATE INDEX IF NOT EXISTS idx_professor_coordenador_email ON ProfessorCoordenador(email);
CREATE INDEX IF NOT EXISTS idx_materia_nome ON Materia(nome);
CREATE INDEX IF NOT EXISTS idx_materia_professor ON MateriaProfessor(professorId);
CREATE INDEX IF NOT EXISTS idx_materia_materia ON MateriaProfessor(materiaId);
