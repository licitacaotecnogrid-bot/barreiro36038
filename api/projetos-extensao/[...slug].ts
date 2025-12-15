import { VercelRequest, VercelResponse } from '@vercel/node';
import { projetoExtensaoQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const id = Array.isArray(slug) ? slug[0] : slug;

  if (!id) {
    if (req.method === 'GET') return handleGetProjetoExtensao(req, res);
    if (req.method === 'POST') return handleCreateProjetoExtensao(req, res);
  } else {
    if (req.method === 'GET') return handleGetProjetoExtensaoById(req, res, id);
    if (req.method === 'PUT') return handleUpdateProjetoExtensao(req, res, id);
    if (req.method === 'DELETE') return handleDeleteProjetoExtensao(req, res, id);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetProjetoExtensao(req: VercelRequest, res: VercelResponse) {
  try {
    const projetos = projetoExtensaoQueries.getAll.all() as any[];
    res.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos de extensão:', error);
    res.status(500).json({ error: 'Failed to fetch extension projects' });
  }
}

async function handleGetProjetoExtensaoById(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const projeto = projetoExtensaoQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de extensão not found' });
    }
    res.json(projeto);
  } catch (error) {
    console.error('Erro ao buscar projeto de extensão:', error);
    res.status(500).json({ error: 'Failed to fetch extension project' });
  }
}

async function handleCreateProjetoExtensao(req: VercelRequest, res: VercelResponse) {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, tipoPessoasProcuram, comunidadeEnvolvida, imagem, professorCoordenadorId } = req.body;

    const result = projetoExtensaoQueries.create.run(
      titulo,
      areaTematica,
      descricao,
      new Date(momentoOcorre).toISOString(),
      tipoPessoasProcuram,
      comunidadeEnvolvida,
      imagem || null,
      professorCoordenadorId
    ) as any;

    const projeto = projetoExtensaoQueries.getById.get(result.lastInsertRowid) as any;
    res.status(201).json(projeto);
  } catch (error) {
    console.error('Error creating extension project:', error);
    res.status(500).json({ error: 'Failed to create extension project' });
  }
}

async function handleUpdateProjetoExtensao(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, tipoPessoasProcuram, comunidadeEnvolvida, imagem } = req.body;
    const projeto = projetoExtensaoQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de extensão not found' });
    }

    projetoExtensaoQueries.update.run(
      titulo || projeto.titulo,
      areaTematica || projeto.areaTematica,
      descricao || projeto.descricao,
      momentoOcorre ? new Date(momentoOcorre).toISOString() : projeto.momentoOcorre,
      tipoPessoasProcuram || projeto.tipoPessoasProcuram,
      comunidadeEnvolvida || projeto.comunidadeEnvolvida,
      imagem || projeto.imagem,
      parseInt(id)
    );

    const updated = projetoExtensaoQueries.getById.get(parseInt(id)) as any;
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar projeto de extensão:', error);
    res.status(500).json({ error: 'Failed to update extension project' });
  }
}

async function handleDeleteProjetoExtensao(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const projeto = projetoExtensaoQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de extensão not found' });
    }
    projetoExtensaoQueries.delete.run(parseInt(id));
    res.json(projeto);
  } catch (error) {
    console.error('Erro ao deletar projeto de extensão:', error);
    res.status(500).json({ error: 'Failed to delete extension project' });
  }
}
