import { RequestHandler } from "express";
import { eventoQueries, odsEventoQueries, anexoEventoQueries } from "../database";

export const handleGetEventos: RequestHandler = async (req, res) => {
  try {
    const eventos = eventoQueries.getAll.all() as any[];
    
    // Get ODS and anexos for each event
    const eventosComDetalhes = eventos.map(evento => {
      const ods = odsEventoQueries.getByEvento.all(evento.id) as any[];
      const anexos = anexoEventoQueries.getByEvento.all(evento.id) as any[];
      
      return {
        ...evento,
        odsAssociadas: ods,
        anexos: anexos,
      };
    });

    res.json(eventosComDetalhes);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
};

export const handleGetEventoById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = eventoQueries.getById.get(parseInt(id)) as any;

    if (!evento) {
      res.status(404).json({ error: "Evento não encontrado" });
      return;
    }

    const ods = odsEventoQueries.getByEvento.all(evento.id) as any[];
    const anexos = anexoEventoQueries.getByEvento.all(evento.id) as any[];

    res.json({
      ...evento,
      odsAssociadas: ods,
      anexos: anexos,
    });
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
};

export const handleCreateEvento: RequestHandler = async (req, res) => {
  try {
    const {
      titulo,
      data,
      responsavel,
      status,
      local,
      curso,
      tipoEvento,
      modalidade,
      descricao,
      imagem,
      documento,
      link,
      odsAssociadas,
      anexos,
    } = req.body;

    if (!titulo || !data || !responsavel || !tipoEvento || !modalidade) {
      res.status(400).json({
        error: "Campos obrigatórios faltando: título, data, responsável, tipo de evento, modalidade",
      });
      return;
    }

    const result = eventoQueries.create.run(
      titulo,
      new Date(data).toISOString(),
      responsavel,
      status || "Pendente",
      local || null,
      curso || "Análise e Desenvolvimento de Sistemas",
      tipoEvento,
      modalidade,
      descricao || null,
      imagem || null,
      documento || null,
      link || null
    ) as any;

    const eventoId = result.lastInsertRowid;

    // Insert ODS
    if (odsAssociadas && Array.isArray(odsAssociadas)) {
      odsAssociadas.forEach((ods: number) => {
        odsEventoQueries.create.run(eventoId, ods);
      });
    }

    // Insert Anexos
    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((nome: string) => {
        anexoEventoQueries.create.run(eventoId, nome);
      });
    }

    const evento = eventoQueries.getById.get(eventoId) as any;
    const odsData = odsEventoQueries.getByEvento.all(eventoId) as any[];
    const anexosData = anexoEventoQueries.getByEvento.all(eventoId) as any[];

    res.status(201).json({
      ...evento,
      odsAssociadas: odsData,
      anexos: anexosData,
    });
  } catch (error) {
    console.error("Error creating evento:", error);
    res.status(500).json({ error: "Erro ao criar evento: " + String(error) });
  }
};

export const handleUpdateEvento: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      data,
      responsavel,
      status,
      local,
      curso,
      tipoEvento,
      modalidade,
      descricao,
      imagem,
      documento,
      link,
      odsAssociadas,
      anexos,
    } = req.body;

    const eventoId = parseInt(id);
    const evento = eventoQueries.getById.get(eventoId) as any;

    if (!evento) {
      res.status(404).json({ error: "Evento não encontrado" });
      return;
    }

    // Delete existing ODS and Anexos
    odsEventoQueries.deleteByEvento.run(eventoId);
    anexoEventoQueries.deleteByEvento.run(eventoId);

    // Update evento
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

    // Insert new ODS
    if (odsAssociadas && Array.isArray(odsAssociadas)) {
      odsAssociadas.forEach((ods: number) => {
        odsEventoQueries.create.run(eventoId, ods);
      });
    }

    // Insert new Anexos
    if (anexos && Array.isArray(anexos)) {
      anexos.forEach((nome: string) => {
        anexoEventoQueries.create.run(eventoId, nome);
      });
    }

    const updated = eventoQueries.getById.get(eventoId) as any;
    const odsData = odsEventoQueries.getByEvento.all(eventoId) as any[];
    const anexosData = anexoEventoQueries.getByEvento.all(eventoId) as any[];

    res.json({
      ...updated,
      odsAssociadas: odsData,
      anexos: anexosData,
    });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
};

export const handleDeleteEvento: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const eventoId = parseInt(id);

    const evento = eventoQueries.getById.get(eventoId) as any;
    if (!evento) {
      res.status(404).json({ error: "Evento não encontrado" });
      return;
    }

    eventoQueries.delete.run(eventoId);

    res.json({ message: "Evento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
};
