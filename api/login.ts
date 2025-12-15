import { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const result = await sql`
      SELECT id, nome, email, cargo FROM "Usuario"
      WHERE email = ${email} AND senha = ${senha}
    `;

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado ou senha incorreta" });
    }

    const usuario = result.rows[0];
    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    });
  } catch (error: any) {
    console.error("Erro ao fazer login:", error?.message);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
