import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production' || !process.env.DATABASE_URL;
const dbPath = isDev ? path.join(__dirname, '../database/dev.db') : null;

// Use Supabase in production if DATABASE_URL is set, otherwise use SQLite locally
let db: Database.Database | null = null;
let isSupabase = false;

if (!isDev && process.env.DATABASE_URL) {
  // Using Supabase (PostgreSQL) - queries will work as-is since they're standard SQL
  isSupabase = true;
  console.log('🔗 Conectando ao banco de dados Supabase...');
} else {
  // Initialize SQLite for development
  if (dbPath) {
    if (!fs.existsSync(dbPath)) {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Criar o banco com o schema
      const tempDb = new Database(dbPath);
      const schemaPath = path.join(__dirname, '../database/init.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      schema.split(';').forEach((statement) => {
        if (statement.trim()) {
          tempDb.exec(statement);
        }
      });

      tempDb.close();
    }

    // Conectar ao banco
    db = new Database(dbPath);

    // Habilitar WAL mode para melhor concorrência
    db.pragma('journal_mode = WAL');
  }
}

// Query executor helper for both SQLite and Supabase
function createQueryHelper(sqliteDb: Database.Database | null) {
  if (!sqliteDb) {
    throw new Error('Database not initialized');
  }

  return {
    prepare: (sql: string) => sqliteDb.prepare(sql),
  };
}

const queryHelper = db ? createQueryHelper(db) : null;

// Queries preparadas para Usuario
export const usuarioQueries = {
  login: db ? db.prepare('SELECT id, nome, email, cargo FROM Usuario WHERE email = ? AND senha = ?') : null as any,
  getAll: db ? db.prepare('SELECT id, nome, email, cargo FROM Usuario') : null as any,
  getById: db ? db.prepare('SELECT * FROM Usuario WHERE id = ?') : null as any,
  getByEmail: db ? db.prepare('SELECT * FROM Usuario WHERE email = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO Usuario (nome, email, senha, cargo)
    VALUES (?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE Usuario
    SET nome = COALESCE(?, nome),
        senha = COALESCE(?, senha),
        cargo = COALESCE(?, cargo),
        atualizadoEm = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM Usuario WHERE id = ?') : null as any,
};

// Queries preparadas para Evento
export const eventoQueries = {
  getAll: db ? db.prepare(`
    SELECT e.* FROM Evento e
    ORDER BY e.data DESC
  `) : null as any,
  getById: db ? db.prepare('SELECT * FROM Evento WHERE id = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO Evento (titulo, data, responsavel, status, local, curso, tipoEvento, modalidade, descricao, imagem, documento, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE Evento
    SET titulo = COALESCE(?, titulo),
        data = COALESCE(?, data),
        responsavel = COALESCE(?, responsavel),
        status = COALESCE(?, status),
        local = COALESCE(?, local),
        curso = COALESCE(?, curso),
        tipoEvento = COALESCE(?, tipoEvento),
        modalidade = COALESCE(?, modalidade),
        descricao = COALESCE(?, descricao),
        imagem = COALESCE(?, imagem),
        documento = COALESCE(?, documento),
        link = COALESCE(?, link),
        atualizadoEm = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM Evento WHERE id = ?') : null as any,
};

// Queries preparadas para OdsEvento
export const odsEventoQueries = {
  getByEvento: db ? db.prepare('SELECT * FROM OdsEvento WHERE eventoId = ?') : null as any,
  deleteByEvento: db ? db.prepare('DELETE FROM OdsEvento WHERE eventoId = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO OdsEvento (eventoId, odsNumero)
    VALUES (?, ?)
  `) : null as any,
};

// Queries preparadas para AnexoEvento
export const anexoEventoQueries = {
  getByEvento: db ? db.prepare('SELECT * FROM AnexoEvento WHERE eventoId = ?') : null as any,
  deleteByEvento: db ? db.prepare('DELETE FROM AnexoEvento WHERE eventoId = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO AnexoEvento (eventoId, nome)
    VALUES (?, ?)
  `) : null as any,
};

// Queries preparadas para ComentarioEvento
export const comentarioQueries = {
  getByEvento: db ? db.prepare(`
    SELECT c.*, u.nome as usuarioNome, u.email as usuarioEmail
    FROM ComentarioEvento c
    LEFT JOIN Usuario u ON c.usuarioId = u.id
    WHERE c.eventoId = ?
    ORDER BY c.criadoEm DESC
  `) : null as any,
  getById: db ? db.prepare('SELECT * FROM ComentarioEvento WHERE id = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO ComentarioEvento (eventoId, usuarioId, autor, conteudo)
    VALUES (?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE ComentarioEvento
    SET conteudo = ?,
        atualizadoEm = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM ComentarioEvento WHERE id = ?') : null as any,
};

// Queries preparadas para ProfessorCoordenador
export const professorQueries = {
  getAll: db ? db.prepare('SELECT * FROM ProfessorCoordenador') : null as any,
  getById: db ? db.prepare('SELECT * FROM ProfessorCoordenador WHERE id = ?') : null as any,
  getByEmail: db ? db.prepare('SELECT * FROM ProfessorCoordenador WHERE email = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO ProfessorCoordenador (nome, email, senha, curso)
    VALUES (?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE ProfessorCoordenador
    SET nome = ?, email = ?, senha = ?, curso = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM ProfessorCoordenador WHERE id = ?') : null as any,
};

// Queries preparadas para ProjetoPesquisa
export const projetoPesquisaQueries = {
  getAll: db ? db.prepare('SELECT * FROM ProjetoPesquisa ORDER BY createdAt DESC') : null as any,
  getById: db ? db.prepare('SELECT * FROM ProjetoPesquisa WHERE id = ?') : null as any,
  getByProfessor: db ? db.prepare('SELECT * FROM ProjetoPesquisa WHERE professorCoordenadorId = ? ORDER BY createdAt DESC') : null as any,
  create: db ? db.prepare(`
    INSERT INTO ProjetoPesquisa (titulo, areaTematica, descricao, momentoOcorre, problemaPesquisa, metodologia, resultadosEsperados, imagem, professorCoordenadorId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE ProjetoPesquisa
    SET titulo = ?, areaTematica = ?, descricao = ?, momentoOcorre = ?, problemaPesquisa = ?, metodologia = ?, resultadosEsperados = ?, imagem = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM ProjetoPesquisa WHERE id = ?') : null as any,
};

// Queries preparadas para ProjetoExtensao
export const projetoExtensaoQueries = {
  getAll: db ? db.prepare('SELECT * FROM ProjetoExtensao ORDER BY createdAt DESC') : null as any,
  getById: db ? db.prepare('SELECT * FROM ProjetoExtensao WHERE id = ?') : null as any,
  getByProfessor: db ? db.prepare('SELECT * FROM ProjetoExtensao WHERE professorCoordenadorId = ? ORDER BY createdAt DESC') : null as any,
  create: db ? db.prepare(`
    INSERT INTO ProjetoExtensao (titulo, areaTematica, descricao, momentoOcorre, tipoPessoasProcuram, comunidadeEnvolvida, imagem, professorCoordenadorId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE ProjetoExtensao
    SET titulo = ?, areaTematica = ?, descricao = ?, momentoOcorre = ?, tipoPessoasProcuram = ?, comunidadeEnvolvida = ?, imagem = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM ProjetoExtensao WHERE id = ?') : null as any,
};

// Queries preparadas para Materia
export const materiaQueries = {
  getAll: db ? db.prepare('SELECT * FROM Materia') : null as any,
  getById: db ? db.prepare('SELECT * FROM Materia WHERE id = ?') : null as any,
  getByNome: db ? db.prepare('SELECT * FROM Materia WHERE nome = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO Materia (nome, descricao)
    VALUES (?, ?)
  `) : null as any,
  update: db ? db.prepare(`
    UPDATE Materia
    SET nome = ?, descricao = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM Materia WHERE id = ?') : null as any,
};

// Queries preparadas para MateriaProfessor
export const materiaProfessorQueries = {
  getAll: db ? db.prepare('SELECT * FROM MateriaProfessor') : null as any,
  getByMateria: db ? db.prepare('SELECT * FROM MateriaProfessor WHERE materiaId = ?') : null as any,
  getByProfessor: db ? db.prepare('SELECT * FROM MateriaProfessor WHERE professorId = ?') : null as any,
  create: db ? db.prepare(`
    INSERT INTO MateriaProfessor (professorId, materiaId, tipoCoordenacao)
    VALUES (?, ?, ?)
  `) : null as any,
  delete: db ? db.prepare('DELETE FROM MateriaProfessor WHERE id = ?') : null as any,
};

export function getDatabase() {
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
}

export function isSupabaseMode() {
  return isSupabase;
}
