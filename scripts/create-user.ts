import Database from 'better-sqlite3';
import * as path from 'path';

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

async function createUser() {
  try {
    const insertUsuario = db.prepare(`
      INSERT INTO Usuario (nome, email, senha, cargo)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertUsuario.run(
      'Luan Mendes',
      'luan@pucminas.br',
      'senha123',
      'Aluno'
    ) as any;

    const getUsuario = db.prepare('SELECT * FROM Usuario WHERE id = ?');
    const user = getUsuario.get(result.lastInsertRowid);

    console.log("✅ Usuário criado com sucesso!");
    console.log(JSON.stringify(user, null, 2));
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      console.error("❌ Erro: Este email já existe");
    } else {
      console.error("❌ Erro ao criar usuário:", error.message);
    }
  } finally {
    db.close();
  }
}

createUser();
