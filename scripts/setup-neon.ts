import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Recria __filename e __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não foi definida. Configure a variável de ambiente.");
  process.exit(1);
}

async function setupNeon() {
  console.log("🚀 Inicializando setup do Neon database...\n");

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Lê o schema SQL
    const schemaPath = path.join(__dirname, "../database/init-postgres.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Executa o schema
    console.log("📝 Criando tabelas...");
    const client = await pool.connect();

    try {
      // Executa todos os statements
      const statements = schema.split(";").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }

      console.log("✅ Tabelas criadas com sucesso!\n");

      // Dados de teste
      console.log("🌱 Inserindo dados de teste...");

      // Insere usuário Admin (incluindo atualizadoEm para evitar NOT NULL)
      await client.query(
        `INSERT INTO "Usuario" (nome, email, senha, cargo, "atualizadoEm")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        ["Admin", "admin@barreiro360.com", "admin123", "Admin", new Date()]
      );

      console.log("✅ Dados de teste inseridos!\n");

      // Verificação
      console.log("🔍 Verificando...");
      const result = await client.query('SELECT COUNT(*) FROM "Usuario"');
      console.log(`✅ Total de usuários: ${result.rows[0].count}\n`);

      console.log("🎉 Setup concluído com sucesso!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Erro durante o setup:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupNeon();
