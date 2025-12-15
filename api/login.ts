import { VercelRequest, VercelResponse } from '@vercel/node';
import { usuarioQueries } from '../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const usuario = usuarioQueries.login.get(email, senha) as any;

    if (!usuario) {
      res.status(401).json({ error: 'Usuário não encontrado ou senha incorreta' });
      return;
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}
