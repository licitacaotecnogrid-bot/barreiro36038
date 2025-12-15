import { VercelRequest, VercelResponse } from "@vercel/node";
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

function getSql(databaseUrl: string): ReturnType<typeof postgres> {
  if (!sql) {
    sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 30,
      connect_timeout: 10,
    });
  }
  return sql;
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

    const db = getSql(databaseUrl);

    try {
      const usuarios = await db`
        SELECT id, nome, email, cargo FROM "Usuario"
        WHERE email = ${email} AND senha = ${senha}
      `;

      if (usuarios.length === 0) {
        return res
          .status(401)
          .json({ error: "Usuário não encontrado ou senha incorreta" });
      }

      const usuario = usuarios[0];
      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      });
    } catch (queryError) {
      console.error("Erro na query:", queryError);
      return res.status(500).json({ error: "Erro ao consultar banco de dados" });
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
