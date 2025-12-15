import { VercelRequest, VercelResponse } from "@vercel/node";
import postgres from "postgres";

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

    // Create a new connection for this request (serverless-friendly)
    const sql = postgres(databaseUrl, {
      ssl: "require",
      max: 1,
      idle_timeout: 10,
      connect_timeout: 15,
    });

    try {
      const usuarios = await sql`
        SELECT id, nome, email, cargo FROM "Usuario"
        WHERE email = ${email} AND senha = ${senha}
      `;

      await sql.end();

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
    } catch (queryError: any) {
      console.error("Erro na query:", queryError?.message, queryError?.code);
      await sql.end().catch(() => {});
      return res
        .status(500)
        .json({ error: "Erro ao consultar banco de dados" });
    }
  } catch (error: any) {
    console.error("Erro ao fazer login:", error?.message);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
