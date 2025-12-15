import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL não configurada");
    return res.status(500).json({
      error:
        "Banco de dados não configurado. Configure a variável DATABASE_URL em suas variáveis de ambiente do Vercel.",
    });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const pool = new Pool({ connectionString: databaseUrl });

    const result = await pool.query(
      'SELECT id, nome, email, cargo FROM "Usuario" WHERE email = $1 AND senha = $2',
      [email, senha],
    );

    await pool.end();

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
