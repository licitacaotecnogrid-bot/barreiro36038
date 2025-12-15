import { VercelRequest, VercelResponse } from '@vercel/node';
import { usuarioQueries, professorQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  if (segments.length === 0) {
    if (req.method === 'GET') return handleGetProfessores(req, res);
    if (req.method === 'POST') return handleCreateProfessor(req, res);
  } else if (segments.length === 1) {
    const id = segments[0];
    if (req.method === 'GET') return handleGetProfessor(req, res, id);
    if (req.method === 'PUT') return handleUpdateProfessor(req, res, id);
    if (req.method === 'DELETE') return handleDeleteProfessor(req, res, id);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetProfessores(req: VercelRequest, res: VercelResponse) {
  try {
    const coordenadores = usuarioQueries.getAll.all() as any[];
    const filtered = coordenadores.filter((u) => u.cargo === 'Coordenador');
    res.json(filtered);
  } catch (error) {
    console.error('Erro ao buscar coordenadores:', error);
    res.status(500).json({ error: 'Failed to fetch coordinators' });
  }
}

async function handleGetProfessor(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const professor = professorQueries.getById.get(parseInt(id)) as any;
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    res.json(professor);
  } catch (error) {
    console.error('Erro ao buscar professor:', error);
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
}

async function handleCreateProfessor(req: VercelRequest, res: VercelResponse) {
  try {
    const { nome, email, senha, curso } = req.body;
    if (!nome || !email || !senha || !curso) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = professorQueries.getByEmail.get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const result = professorQueries.create.run(nome, email, senha, curso) as any;
    const professor = professorQueries.getById.get(result.lastInsertRowid) as any;

    res.status(201).json(professor);
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    res.status(500).json({ error: 'Failed to create professor' });
  }
}

async function handleUpdateProfessor(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { nome, email, senha, curso } = req.body;
    const professor = professorQueries.getById.get(parseInt(id)) as any;

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    professorQueries.update.run(
      nome || professor.nome,
      email || professor.email,
      senha || professor.senha,
      curso || professor.curso,
      parseInt(id)
    );

    const updated = professorQueries.getById.get(parseInt(id)) as any;
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(500).json({ error: 'Failed to update professor' });
  }
}

async function handleDeleteProfessor(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const professor = professorQueries.getById.get(parseInt(id)) as any;
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    professorQueries.delete.run(parseInt(id));
    res.json(professor);
  } catch (error) {
    console.error('Erro ao deletar professor:', error);
    res.status(500).json({ error: 'Failed to delete professor' });
  }
}
