import { VercelRequest, VercelResponse } from '@vercel/node';
import { usuarioQueries, professorQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  if (segments.length === 0) {
    // GET /api/usuarios, POST /api/usuarios
    if (req.method === 'GET') {
      return handleGetUsuarios(req, res);
    } else if (req.method === 'POST') {
      return handleCreateUsuario(req, res);
    }
  } else if (segments.length === 1) {
    // GET /api/usuarios/:id, PUT /api/usuarios/:id, DELETE /api/usuarios/:id
    const id = segments[0];
    if (req.method === 'GET') {
      return handleGetUsuario(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateUsuario(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteUsuario(req, res, id);
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetUsuarios(req: VercelRequest, res: VercelResponse) {
  try {
    const usuarios = usuarioQueries.getAll.all() as any[];
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

async function handleGetUsuario(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const usuario = usuarioQueries.getById.get(parseInt(id)) as any;
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

async function handleCreateUsuario(req: VercelRequest, res: VercelResponse) {
  try {
    const { nome, email, senha, cargo, curso } = req.body;

    if (!nome || !email || !senha || !cargo) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      return;
    }

    const existing = usuarioQueries.getByEmail.get(email);
    if (existing) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const result = usuarioQueries.create.run(nome, email, senha, cargo) as any;
    const usuarioId = result.lastInsertRowid;

    if (cargo === 'Professor') {
      professorQueries.create.run(
        nome,
        email,
        senha,
        curso || 'Análise e Desenvolvimento de Sistemas'
      );
    }

    const usuario = usuarioQueries.getById.get(usuarioId) as any;

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

async function handleUpdateUsuario(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { nome, senha, cargo } = req.body;

    const usuario = usuarioQueries.getById.get(parseInt(id)) as any;
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    usuarioQueries.update.run(nome, senha, cargo, parseInt(id));

    const updated = usuarioQueries.getById.get(parseInt(id)) as any;

    res.json({
      id: updated.id,
      nome: updated.nome,
      email: updated.email,
      cargo: updated.cargo,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

async function handleDeleteUsuario(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const usuario = usuarioQueries.getById.get(parseInt(id)) as any;
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    usuarioQueries.delete.run(parseInt(id));

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
}
