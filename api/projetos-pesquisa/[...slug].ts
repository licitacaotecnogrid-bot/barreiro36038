import { VercelRequest, VercelResponse } from '@vercel/node';
import { projetoPesquisaQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const id = Array.isArray(slug) ? slug[0] : slug;

  if (!id) {
    if (req.method === 'GET') return handleGetProjetoPesquisa(req, res);
    if (req.method === 'POST') return handleCreateProjetoPesquisa(req, res);
  } else {
    if (req.method === 'GET') return handleGetProjetoPesquisaById(req, res, id);
    if (req.method === 'PUT') return handleUpdateProjetoPesquisa(req, res, id);
    if (req.method === 'DELETE') return handleDeleteProjetoPesquisa(req, res, id);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetProjetoPesquisa(req: VercelRequest, res: VercelResponse) {
  try {
    const projetos = projetoPesquisaQueries.getAll.all() as any[];
    res.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos de pesquisa:', error);
    res.status(500).json({ error: 'Failed to fetch research projects' });
  }
}

async function handleGetProjetoPesquisaById(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const projeto = projetoPesquisaQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de pesquisa not found' });
    }
    res.json(projeto);
  } catch (error) {
    console.error('Erro ao buscar projeto de pesquisa:', error);
    res.status(500).json({ error: 'Failed to fetch research project' });
  }
}

async function handleCreateProjetoPesquisa(req: VercelRequest, res: VercelResponse) {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, problemaPesquisa, metodologia, resultadosEsperados, imagem, professorCoordenadorId } = req.body;

    const result = projetoPesquisaQueries.create.run(
      titulo,
      areaTematica,
      descricao,
      new Date(momentoOcorre).toISOString(),
      problemaPesquisa,
      metodologia,
      resultadosEsperados,
      imagem || null,
      professorCoordenadorId
    ) as any;

    const projeto = projetoPesquisaQueries.getById.get(result.lastInsertRowid) as any;
    res.status(201).json(projeto);
  } catch (error) {
    console.error('Error creating research project:', error);
    res.status(500).json({ error: 'Failed to create research project' });
  }
}

async function handleUpdateProjetoPesquisa(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, problemaPesquisa, metodologia, resultadosEsperados, imagem } = req.body;
    const projeto = projetoPesquisaQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de pesquisa not found' });
    }

    projetoPesquisaQueries.update.run(
      titulo || projeto.titulo,
      areaTematica || projeto.areaTematica,
      descricao || projeto.descricao,
      momentoOcorre ? new Date(momentoOcorre).toISOString() : projeto.momentoOcorre,
      problemaPesquisa || projeto.problemaPesquisa,
      metodologia || projeto.metodologia,
      resultadosEsperados || projeto.resultadosEsperados,
      imagem || projeto.imagem,
      parseInt(id)
    );

    const updated = projetoPesquisaQueries.getById.get(parseInt(id)) as any;
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar projeto de pesquisa:', error);
    res.status(500).json({ error: 'Failed to update research project' });
  }
}

async function handleDeleteProjetoPesquisa(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const projeto = projetoPesquisaQueries.getById.get(parseInt(id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto de pesquisa not found' });
    }
    projetoPesquisaQueries.delete.run(parseInt(id));
    res.json(projeto);
  } catch (error) {
    console.error('Erro ao deletar projeto de pesquisa:', error);
    res.status(500).json({ error: 'Failed to delete research project' });
  }
}
