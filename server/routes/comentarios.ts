import { RequestHandler } from "express";
import { comentarioQueries } from "../database";

export const handleGetComentarios: RequestHandler = async (req, res) => {
  try {
    const { eventoId } = req.params;

    const comentarios = comentarioQueries.getByEvento.all(parseInt(eventoId)) as any[];

    const comentariosFormatados = comentarios.map((c) => ({
      id: c.id,
      eventoId: c.eventoId,
      usuarioId: c.usuarioId,
      autor: c.autor,
      conteudo: c.conteudo,
      criadoEm: c.criadoEm,
      atualizadoEm: c.atualizadoEm,
      usuario: c.usuarioId ? {
        id: c.usuarioId,
        nome: c.usuarioNome,
        email: c.usuarioEmail,
      } : null,
    }));

    res.json(comentariosFormatados);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
};

export const handleCreateComentario: RequestHandler = async (req, res) => {
  try {
    const { eventoId } = req.params;
    const { usuarioId, autor, conteudo } = req.body;

    if (!autor || !conteudo) {
      res.status(400).json({ error: "Autor e conteúdo são obrigatórios" });
      return;
    }

    const result = comentarioQueries.create.run(
      parseInt(eventoId),
      usuarioId ? parseInt(usuarioId) : null,
      autor,
      conteudo
    ) as any;

    const comentarioId = result.lastInsertRowid;
    const comentario = comentarioQueries.getById.get(comentarioId) as any;

    res.status(201).json(comentario);
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(500).json({ error: "Erro ao criar comentário" });
  }
};

export const handleDeleteComentario: RequestHandler = async (req, res) => {
  try {
    const { eventoId, comentarioId } = req.params;

    const comentario = comentarioQueries.getById.get(parseInt(comentarioId)) as any;

    if (!comentario) {
      res.status(404).json({ error: "Comentário não encontrado" });
      return;
    }

    if (comentario.eventoId !== parseInt(eventoId)) {
      res.status(400).json({ error: "Comentário não pertence a este evento" });
      return;
    }

    comentarioQueries.delete.run(parseInt(comentarioId));

    res.json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    res.status(500).json({ error: "Erro ao deletar comentário" });
  }
};

export const handleUpdateComentario: RequestHandler = async (req, res) => {
  try {
    const { eventoId, comentarioId } = req.params;
    const { conteudo } = req.body;

    if (!conteudo) {
      res.status(400).json({ error: "Conteúdo é obrigatório" });
      return;
    }

    const comentario = comentarioQueries.getById.get(parseInt(comentarioId)) as any;

    if (!comentario) {
      res.status(404).json({ error: "Comentário não encontrado" });
      return;
    }

    if (comentario.eventoId !== parseInt(eventoId)) {
      res.status(400).json({ error: "Comentário não pertence a este evento" });
      return;
    }

    comentarioQueries.update.run(conteudo, parseInt(comentarioId));

    const updated = comentarioQueries.getById.get(parseInt(comentarioId)) as any;

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    res.status(500).json({ error: "Erro ao atualizar comentário" });
  }
};
