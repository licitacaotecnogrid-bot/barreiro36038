import { VercelRequest, VercelResponse } from '@vercel/node';
import { eventoQueries, odsEventoQueries, anexoEventoQueries, comentarioQueries } from '../../server/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  // /api/eventos
  if (segments.length === 0) {
    if (req.method === 'GET') return handleGetEventos(req, res);
    if (req.method === 'POST') return handleCreateEvento(req, res);
  }

  // /api/eventos/:id
  if (segments.length === 1) {
    const id = segments[0];
    if (req.method === 'GET') return handleGetEventoById(req, res, id);
    if (req.method === 'PUT') return handleUpdateEvento(req, res, id);
    if (req.method === 'DELETE') return handleDeleteEvento(req, res, id);
  }

  // /api/eventos/:id/comentarios
  if (segments.length === 2 && segments[1] === 'comentarios') {
    const eventoId = segments[0];
    if (req.method === 'GET') return handleGetComentarios(req, res, eventoId);
    if (req.method === 'POST') return handleCreateComentario(req, res, eventoId);
  }

  // /api/eventos/:id/comentarios/:comentarioId
  if (segments.length === 3 && segments[1] === 'comentarios') {
    const eventoId = segments[0];
    const comentarioId = segments[2];
    if (req.method === 'PUT') return handleUpdateComentario(req, res, eventoId, comentarioId);
    if (req.method === 'DELETE') return handleDeleteComentario(req, res, eventoId, comentarioId);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetEventos(req: VercelRequest, res: VercelResponse) {
  try {
    const eventos = eventoQueries.getAll.all() as any[];
    const eventosComDetalhes = eventos.map((evento) => {
      const ods = odsEventoQueries.getByEvento.all(evento.id) as any[];
      const anexos = anexoEventoQueries.getByEvento.all(evento.id) as any[];
      return { ...evento, odsAssociadas: ods, anexos };
    });
    res.json(eventosComDetalhes);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
}

async function handleGetEventoById(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const evento = eventoQueries.getById.get(parseInt(id)) as any;
    if (!evento) {
      res.status(404).json({ error: 'Evento não encontrado' });
      return;
    }
    const ods = odsEventoQueries.getByEvento.all(evento.id) as any[];
    const anexos = anexoEventoQueries.getByEvento.all(evento.id) as any[];
    res.json({ ...evento, odsAssociadas: ods, anexos });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
}

async function handleCreateEvento(req: VercelRequest, res: VercelResponse) {
  try {
    const { titulo, data, responsavel, status, local, curso, tipoEvento, modalidade, descricao, imagem, documento, link, odsAssociadas, anexos } = req.body;

    if (!titulo || !data || !responsavel || !tipoEvento || !modalidade) {
      res.status(400).json({
        error: 'Campos obrigatórios faltando: título, data, responsável, tipo de evento, modalidade',
      });
      return;
    }

    const result = eventoQueries.create.run(
      titulo,
      new Date(data).toISOString(),
      responsavel,
      status || 'Pendente',
      local || null,
      curso || 'Análise e Desenvolvimento de Sistemas',
      tipoEvento,
      modalidade,
      descricao || null,
      imagem || null,
      documento || null,
      link || null
    ) as any;

    const eventoId = result.lastInsertRowid;

    if (odsAssociadas && Array.isArray(odsAssociadas)) {
      odsAssociadas.forEach((ods: number) => odsEventoQueries.create.run(eventoId, ods));
    }

    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((nome: string) => anexoEventoQueries.create.run(eventoId, nome));
    }

    const evento = eventoQueries.getById.get(eventoId) as any;
    const odsData = odsEventoQueries.getByEvento.all(eventoId) as any[];
    const anexosData = anexoEventoQueries.getByEvento.all(eventoId) as any[];

    res.status(201).json({ ...evento, odsAssociadas: odsData, anexos: anexosData });
  } catch (error) {
    console.error('Error creating evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento: ' + String(error) });
  }
}

async function handleUpdateEvento(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const eventoId = parseInt(id);
    const { titulo, data, responsavel, status, local, curso, tipoEvento, modalidade, descricao, imagem, documento, link, odsAssociadas, anexos } = req.body;

    const evento = eventoQueries.getById.get(eventoId) as any;
    if (!evento) {
      res.status(404).json({ error: 'Evento não encontrado' });
      return;
    }

    odsEventoQueries.deleteByEvento.run(eventoId);
    anexoEventoQueries.deleteByEvento.run(eventoId);

    eventoQueries.update.run(
      titulo || evento.titulo,
      data ? new Date(data).toISOString() : evento.data,
      responsavel || evento.responsavel,
      status !== undefined ? status : evento.status,
      local !== undefined ? local : evento.local,
      curso || evento.curso,
      tipoEvento || evento.tipoEvento,
      modalidade || evento.modalidade,
      descricao !== undefined ? descricao : evento.descricao,
      imagem || evento.imagem,
      documento || evento.documento,
      link !== undefined ? link : evento.link,
      eventoId
    );

    if (odsAssociadas && Array.isArray(odsAssociadas)) {
      odsAssociadas.forEach((ods: number) => odsEventoQueries.create.run(eventoId, ods));
    }

    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((nome: string) => anexoEventoQueries.create.run(eventoId, nome));
    }

    const updated = eventoQueries.getById.get(eventoId) as any;
    const odsData = odsEventoQueries.getByEvento.all(eventoId) as any[];
    const anexosData = anexoEventoQueries.getByEvento.all(eventoId) as any[];

    res.json({ ...updated, odsAssociadas: odsData, anexos: anexosData });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

async function handleDeleteEvento(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const eventoId = parseInt(id);
    const evento = eventoQueries.getById.get(eventoId) as any;
    if (!evento) {
      res.status(404).json({ error: 'Evento não encontrado' });
      return;
    }
    eventoQueries.delete.run(eventoId);
    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
}

async function handleGetComentarios(req: VercelRequest, res: VercelResponse, eventoId: string) {
  try {
    const comentarios = comentarioQueries.getByEvento.all(parseInt(eventoId)) as any[];
    const comentariosFormatados = comentarios.map((c) => ({
      id: c.id,
      eventoId: c.eventoId,
      usuarioId: c.usuarioId,
      autor: c.autor,
      conteudo: c.conteudo,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
      usuario: c.usuarioId ? { id: c.usuarioId, nome: c.usuarioNome, email: c.usuarioEmail } : null,
    }));
    res.json(comentariosFormatados);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
}

async function handleCreateComentario(req: VercelRequest, res: VercelResponse, eventoId: string) {
  try {
    const { usuarioId, autor, conteudo } = req.body;
    if (!autor || !conteudo) {
      res.status(400).json({ error: 'Autor e conteúdo são obrigatórios' });
      return;
    }
    const result = comentarioQueries.create.run(parseInt(eventoId), usuarioId ? parseInt(usuarioId) : null, autor, conteudo) as any;
    const comentario = comentarioQueries.getById.get(result.lastInsertRowid) as any;
    res.status(201).json(comentario);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
}

async function handleUpdateComentario(req: VercelRequest, res: VercelResponse, eventoId: string, comentarioId: string) {
  try {
    const { conteudo } = req.body;
    if (!conteudo) {
      res.status(400).json({ error: 'Conteúdo é obrigatório' });
      return;
    }
    const comentario = comentarioQueries.getById.get(parseInt(comentarioId)) as any;
    if (!comentario || comentario.eventoId !== parseInt(eventoId)) {
      res.status(404).json({ error: 'Comentário não encontrado' });
      return;
    }
    comentarioQueries.update.run(conteudo, parseInt(comentarioId));
    const updated = comentarioQueries.getById.get(parseInt(comentarioId)) as any;
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ error: 'Erro ao atualizar comentário' });
  }
}

async function handleDeleteComentario(req: VercelRequest, res: VercelResponse, eventoId: string, comentarioId: string) {
  try {
    const comentario = comentarioQueries.getById.get(parseInt(comentarioId)) as any;
    if (!comentario || comentario.eventoId !== parseInt(eventoId)) {
      res.status(404).json({ error: 'Comentário não encontrado' });
      return;
    }
    comentarioQueries.delete.run(parseInt(comentarioId));
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
}
