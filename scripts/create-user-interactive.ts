import Database from 'better-sqlite3';
import * as path from 'path';
import * as readline from "readline";

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("\n📝 Criar Novo Usuário\n");

  const nome = await question("Nome completo: ");
  const email = await question("E-mail (ex: nome@pucminas.br): ");
  const senha = await question("Senha: ");
  const cargo = await question("Cargo (Aluno/Professor/Coordenador) [Aluno]: ") || "Aluno";

  if (!nome.trim() || !email.trim() || !senha.trim()) {
    console.error("❌ Nome, email e senha são obrigatórios");
    rl.close();
    db.close();
    process.exit(1);
  }

  try {
    console.log("\n⏳ Criando usuário...");

    // Check if email already exists
    const getByEmail = db.prepare('SELECT * FROM Usuario WHERE email = ?');
    const existing = getByEmail.get(email);

    if (existing) {
      throw new Error(`O email "${email}" já está cadastrado`);
    }

    const insertUsuario = db.prepare(`
      INSERT INTO Usuario (nome, email, senha, cargo)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertUsuario.run(nome, email, senha, cargo) as any;
    const getUsuario = db.prepare('SELECT * FROM Usuario WHERE id = ?');
    const user = getUsuario.get(result.lastInsertRowid) as any;

    console.log("\n✅ Usuário criado com sucesso!\n");
    console.log(`ID:    ${user.id}`);
    console.log(`Nome:  ${user.nome}`);
    console.log(`Email: ${user.email}`);
    console.log(`Cargo: ${user.cargo}`);
    console.log(`Criado em: ${new Date(user.criadoEm).toLocaleString("pt-BR")}\n`);
  } catch (error: any) {
    console.error(`\n❌ Erro ao criar usuário: ${error.message}`);
    process.exit(1);
  } finally {
    db.close();
    rl.close();
  }
}

main();
