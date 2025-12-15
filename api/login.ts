import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error("DATABASE_URL não configurada");
      res
        .status(500)
        .json({
          error:
            "Banco de dados não configurado. Configure a variável DATABASE_URL em suas variáveis de ambiente do Vercel.",
        });
      return;
    }

    // For PostgreSQL (Supabase)
    const { default: pg } = await import("pg");
    const { Pool } = pg;
    const pool = new Pool({ connectionString: databaseUrl });

    try {
      const result = await pool.query(
        'SELECT id, nome, email, cargo FROM "Usuario" WHERE email = $1 AND senha = $2',
        [email, senha],
      );

      if (result.rows.length === 0) {
        res
          .status(401)
          .json({ error: "Usuário não encontrado ou senha incorreta" });
        return;
      }

      const usuario = result.rows[0];
      res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      });
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}
