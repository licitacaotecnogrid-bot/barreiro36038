import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleGetUsuarios,
  handleCreateUsuario,
  handleUpdateUsuario,
  handleDeleteUsuario,
} from "./routes/usuarios";
import {
  handleGetEventos,
  handleGetEventoById,
  handleCreateEvento,
  handleUpdateEvento,
  handleDeleteEvento,
} from "./routes/eventos";
import {
  handleGetComentarios,
  handleCreateComentario,
  handleDeleteComentario,
  handleUpdateComentario,
} from "./routes/comentarios";
import {
  usuarioQueries,
  professorQueries,
  projetoPesquisaQueries,
  projetoExtensaoQueries,
  materiaQueries,
} from "./database";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
});

app.get("/api/demo", handleDemo);

// Usuários endpoints
app.post("/api/login", handleLogin);
app.get("/api/usuarios", handleGetUsuarios);
app.post("/api/usuarios", handleCreateUsuario);
app.put("/api/usuarios/:id", handleUpdateUsuario);
app.delete("/api/usuarios/:id", handleDeleteUsuario);

// Eventos endpoints
app.get("/api/eventos", handleGetEventos);
app.get("/api/eventos/:id", handleGetEventoById);
app.post("/api/eventos", handleCreateEvento);
app.put("/api/eventos/:id", handleUpdateEvento);
app.delete("/api/eventos/:id", handleDeleteEvento);

// Comentários endpoints
app.get("/api/eventos/:eventoId/comentarios", handleGetComentarios);
app.post("/api/eventos/:eventoId/comentarios", handleCreateComentario);
app.put("/api/eventos/:eventoId/comentarios/:comentarioId", handleUpdateComentario);
app.delete("/api/eventos/:eventoId/comentarios/:comentarioId", handleDeleteComentario);

// Professor endpoints
app.get("/api/professores", (_req, res) => {
  try {
    const professors = professorQueries.getAll.all() as any[];
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch professors" });
  }
});

app.post("/api/professores", (req, res) => {
  try {
    const { nome, email, senha, curso } = req.body;
    if (!nome || !email || !senha || !curso) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = professorQueries.getByEmail.get(email);
    if (existing) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const result = professorQueries.create.run(nome, email, senha, curso) as any;
    const professor = professorQueries.getById.get(result.lastInsertRowid) as any;

    res.status(201).json(professor);
  } catch (error) {
    res.status(500).json({ error: "Failed to create professor" });
  }
});

app.get("/api/professores/:id", (req, res) => {
  try {
    const professor = professorQueries.getById.get(parseInt(req.params.id)) as any;
    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch professor" });
  }
});

app.put("/api/professores/:id", (req, res) => {
  try {
    const { nome, email, senha, curso } = req.body;
    const professor = professorQueries.getById.get(parseInt(req.params.id)) as any;

    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    professorQueries.update.run(
      nome || professor.nome,
      email || professor.email,
      senha || professor.senha,
      curso || professor.curso,
      parseInt(req.params.id)
    );

    const updated = professorQueries.getById.get(parseInt(req.params.id)) as any;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update professor" });
  }
});

app.delete("/api/professores/:id", (req, res) => {
  try {
    const professor = professorQueries.getById.get(parseInt(req.params.id)) as any;
    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }
    professorQueries.delete.run(parseInt(req.params.id));
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete professor" });
  }
});

// Projeto Pesquisa endpoints
app.get("/api/projetos-pesquisa", (_req, res) => {
  try {
    const projetos = projetoPesquisaQueries.getAll.all() as any[];
    res.json(projetos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch research projects" });
  }
});

app.post("/api/projetos-pesquisa", (req, res) => {
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
    console.error("Error creating research project:", error);
    res.status(500).json({ error: "Failed to create research project" });
  }
});

app.get("/api/projetos-pesquisa/:id", (req, res) => {
  try {
    const projeto = projetoPesquisaQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de pesquisa not found" });
    }
    res.json(projeto);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch research project" });
  }
});

app.put("/api/projetos-pesquisa/:id", (req, res) => {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, problemaPesquisa, metodologia, resultadosEsperados, imagem } = req.body;
    const projeto = projetoPesquisaQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de pesquisa not found" });
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
      parseInt(req.params.id)
    );
    const updated = projetoPesquisaQueries.getById.get(parseInt(req.params.id)) as any;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update research project" });
  }
});

app.delete("/api/projetos-pesquisa/:id", (req, res) => {
  try {
    const projeto = projetoPesquisaQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de pesquisa not found" });
    }
    projetoPesquisaQueries.delete.run(parseInt(req.params.id));
    res.json(projeto);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete research project" });
  }
});

// Projeto Extensão endpoints
app.get("/api/projetos-extensao", (_req, res) => {
  try {
    const projetos = projetoExtensaoQueries.getAll.all() as any[];
    res.json(projetos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch extension projects" });
  }
});

app.post("/api/projetos-extensao", (req, res) => {
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
    console.error("Error creating extension project:", error);
    res.status(500).json({ error: "Failed to create extension project" });
  }
});

app.get("/api/projetos-extensao/:id", (req, res) => {
  try {
    const projeto = projetoExtensaoQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de extensão not found" });
    }
    res.json(projeto);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch extension project" });
  }
});

app.put("/api/projetos-extensao/:id", (req, res) => {
  try {
    const { titulo, areaTematica, descricao, momentoOcorre, tipoPessoasProcuram, comunidadeEnvolvida, imagem } = req.body;
    const projeto = projetoExtensaoQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de extensão not found" });
    }
    projetoExtensaoQueries.update.run(
      titulo || projeto.titulo,
      areaTematica || projeto.areaTematica,
      descricao || projeto.descricao,
      momentoOcorre ? new Date(momentoOcorre).toISOString() : projeto.momentoOcorre,
      tipoPessoasProcuram || projeto.tipoPessoasProcuram,
      comunidadeEnvolvida || projeto.comunidadeEnvolvida,
      imagem || projeto.imagem,
      parseInt(req.params.id)
    );
    const updated = projetoExtensaoQueries.getById.get(parseInt(req.params.id)) as any;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update extension project" });
  }
});

app.delete("/api/projetos-extensao/:id", (req, res) => {
  try {
    const projeto = projetoExtensaoQueries.getById.get(parseInt(req.params.id)) as any;
    if (!projeto) {
      return res.status(404).json({ error: "Projeto de extensão not found" });
    }
    projetoExtensaoQueries.delete.run(parseInt(req.params.id));
    res.json(projeto);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete extension project" });
  }
});

// Materia endpoints
app.get("/api/materias", (_req, res) => {
  try {
    const materias = materiaQueries.getAll.all() as any[];
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

app.post("/api/materias", (req, res) => {
  try {
    const { nome, descricao } = req.body;

    const existing = materiaQueries.getByNome.get(nome);
    if (existing) {
      return res.status(400).json({ error: "Matéria já existe" });
    }

    const result = materiaQueries.create.run(nome, descricao) as any;
    const materia = materiaQueries.getById.get(result.lastInsertRowid) as any;

    res.status(201).json(materia);
  } catch (error) {
    res.status(500).json({ error: "Failed to create subject" });
  }
});

app.get("/api/materias/:id", (req, res) => {
  try {
    const materia = materiaQueries.getById.get(parseInt(req.params.id)) as any;
    if (!materia) {
      return res.status(404).json({ error: "Materia not found" });
    }
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subject" });
  }
});

app.put("/api/materias/:id", (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const materia = materiaQueries.getById.get(parseInt(req.params.id)) as any;

    if (!materia) {
      return res.status(404).json({ error: "Materia not found" });
    }

    materiaQueries.update.run(nome || materia.nome, descricao || materia.descricao, parseInt(req.params.id));

    const updated = materiaQueries.getById.get(parseInt(req.params.id)) as any;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update subject" });
  }
});

app.delete("/api/materias/:id", (req, res) => {
  try {
    const materia = materiaQueries.getById.get(parseInt(req.params.id)) as any;
    if (!materia) {
      return res.status(404).json({ error: "Materia not found" });
    }
    materiaQueries.delete.run(parseInt(req.params.id));
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

const port = parseInt(process.env.PORT || "3000", 10);

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`📱 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
