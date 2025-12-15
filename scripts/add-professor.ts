import Database from 'better-sqlite3';
import * as path from 'path';

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

async function main() {
  try {
    const getByEmail = db.prepare('SELECT * FROM ProfessorCoordenador WHERE email = ?');
    const existing = getByEmail.get('humberto@sga.pucminas.br') as any;

    if (existing) {
      // Update existing professor
      const updateProfessor = db.prepare(`
        UPDATE ProfessorCoordenador
        SET nome = ?, senha = ?, curso = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
      `);
      updateProfessor.run('humberto', '123456', 'Análise e Desenvolvimento de Sistemas', 'humberto@sga.pucminas.br');
    } else {
      // Create new professor
      const insertProfessor = db.prepare(`
        INSERT INTO ProfessorCoordenador (nome, email, senha, curso)
        VALUES (?, ?, ?, ?)
      `);
      insertProfessor.run('humberto', 'humberto@sga.pucminas.br', '123456', 'Análise e Desenvolvimento de Sistemas');
    }

    const professor = getByEmail.get('humberto@sga.pucminas.br') as any;

    console.log("✅ Professor criado/atualizado com sucesso!");
    console.log("📧 Email:", professor.email);
    console.log("👤 Nome:", professor.nome);
    console.log("🔑 Senha:", professor.senha);
    console.log("🏫 Curso:", professor.curso);
  } catch (error) {
    console.error("❌ Erro ao criar professor:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
