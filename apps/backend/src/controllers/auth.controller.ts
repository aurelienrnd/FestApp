import type { Request, Response } from "express";
import { query } from "../db";

// NOTE Test de connexion à la base de données, a supprimer plus tard.
export const testGetUsers = async (req: Request, res: Response) => {
  try {
    const rows = await query("SELECT id, email, display_name FROM users");
    console.log("status : ok", rows);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur connexion base de données",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {};
