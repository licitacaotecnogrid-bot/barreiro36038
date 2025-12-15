import { RequestHandler } from "express";
import { usuarioQueries, professorQueries } from "../database";

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const usuario = usuarioQueries.login.get(email, senha) as any;

    if (!usuario) {
      res.status(401).json({ error: "Usuário não encontrado ou senha incorreta" });
      return;
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
};

export const handleGetUsuarios: RequestHandler = async (req, res) => {
  try {
    const usuarios = usuarioQueries.getAll.all() as any[];
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const handleCreateUsuario: RequestHandler = async (req, res) => {
  try {
    const { nome, email, senha, cargo, curso } = req.body;

    if (!nome || !email || !senha || !cargo) {
      res.status(400).json({ error: "Todos os campos são obrigatórios" });
      return;
    }

    // Check if email already exists
    const existing = usuarioQueries.getByEmail.get(email);
    if (existing) {
      res.status(400).json({ error: "Email já cadastrado" });
      return;
    }

    // Create user in Usuario table
    const result = usuarioQueries.create.run(nome, email, senha, cargo) as any;
    const usuarioId = result.lastInsertRowid;

    // If cargo is Professor, also create in ProfessorCoordenador table
    if (cargo === "Professor") {
      professorQueries.create.run(
        nome,
        email,
        senha,
        curso || "Análise e Desenvolvimento de Sistemas"
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
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

export const handleUpdateUsuario: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, senha, cargo } = req.body;

    const usuario = usuarioQueries.getById.get(parseInt(id)) as any;
    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
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
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

export const handleDeleteUsuario: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = usuarioQueries.getById.get(parseInt(id)) as any;
    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    usuarioQueries.delete.run(parseInt(id));

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
};
