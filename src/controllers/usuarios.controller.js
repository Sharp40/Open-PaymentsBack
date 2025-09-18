import pool from "../config/config.db.js";
import bcrypt from "bcrypt"; // para hashear contraseñas
import jwt from "jsonwebtoken"; // para crear tokens JWT

export const register = async (req, res) => {
  try {
    const { nombre, apellidop, apellidom, telefono, correo, clave } = req.body;

    if (!nombre || !apellidop || !apellidom || !correo || !clave) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Verificar si ya existe el correo
    const userExists = await pool.query("SELECT * FROM usuario WHERE correo = $1", [correo]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(clave, 10);

    const result = await pool.query(
      `INSERT INTO usuario (nombre, apellidop, apellidom, telefono, correo, clave)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING idusuario, nombre, correo`,
      [nombre, apellidop, apellidom, telefono, correo, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error en register:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const result = await pool.query("SELECT * FROM usuario WHERE correo = $1", [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(clave, user["clave"]);
    if (!isMatch) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { idusuario: user.idusuario, correo: user.correo },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        idusuario: user.idusuario,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        apellidop: user.apellidop,
        apellidom: user.apellidom
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
