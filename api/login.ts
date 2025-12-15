import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(databaseUrl: string): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL não configurada");
    return res.status(500).json({
      error: "Banco de dados não configurado",
    });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const dbPool = getPool(databaseUrl);

    let result;
    try {
      result = await dbPool.query(
        'SELECT id, nome, email, cargo FROM "Usuario" WHERE email = $1 AND senha = $2',
        [email, senha],
      );
    } catch (queryError) {
      console.error("Erro na query:", queryError);
      return res.status(500).json({ error: "Erro ao consultar banco de dados" });
    }

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuário não encontrado ou senha incorreta" });
    }

    const usuario = result.rows[0];
    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
