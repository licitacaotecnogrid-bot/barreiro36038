import { VercelRequest, VercelResponse } from '@vercel/node';
import { materiaQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  if (segments.length === 0) {
    if (req.method === 'GET') return handleGetMaterias(req, res);
    if (req.method === 'POST') return handleCreateMateria(req, res);
  } else if (segments.length === 1) {
    const id = segments[0];
    if (req.method === 'GET') return handleGetMateria(req, res, id);
    if (req.method === 'PUT') return handleUpdateMateria(req, res, id);
    if (req.method === 'DELETE') return handleDeleteMateria(req, res, id);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetMaterias(req: VercelRequest, res: VercelResponse) {
  try {
    const materias = materiaQueries.getAll.all() as any[];
    res.json(materias);
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}

async function handleGetMateria(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const materia = materiaQueries.getById.get(parseInt(id)) as any;
    if (!materia) {
      return res.status(404).json({ error: 'Materia not found' });
    }
    res.json(materia);
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
}

async function handleCreateMateria(req: VercelRequest, res: VercelResponse) {
  try {
    const { nome, descricao } = req.body;

    const existing = materiaQueries.getByNome.get(nome);
    if (existing) {
      return res.status(400).json({ error: 'Matéria já existe' });
    }

    const result = materiaQueries.create.run(nome, descricao) as any;
    const materia = materiaQueries.getById.get(result.lastInsertRowid) as any;

    res.status(201).json(materia);
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
}

async function handleUpdateMateria(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { nome, descricao } = req.body;
    const materia = materiaQueries.getById.get(parseInt(id)) as any;

    if (!materia) {
      return res.status(404).json({ error: 'Materia not found' });
    }

    materiaQueries.update.run(nome || materia.nome, descricao || materia.descricao, parseInt(id));

    const updated = materiaQueries.getById.get(parseInt(id)) as any;
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
}

async function handleDeleteMateria(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const materia = materiaQueries.getById.get(parseInt(id)) as any;
    if (!materia) {
      return res.status(404).json({ error: 'Materia not found' });
    }
    materiaQueries.delete.run(parseInt(id));
    res.json(materia);
  } catch (error) {
    console.error('Erro ao deletar matéria:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
}
