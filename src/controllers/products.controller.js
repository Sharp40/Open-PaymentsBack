import pool from "../config/config.db.js";


export const getProducts = async (req, res) => {
    const {rows} = await pool.query('SELECT * FROM producto');

    if (rows.length === 0) {
        return res.json({ message: "[]"});
    }
    res.json(rows);
}

export const getProduct = async (req, res) => {
    const {id} = req.params;
    const {rows} = await pool.query('SELECT * FROM producto WHERE idproducto = $1',[id]);
    

    res.json(rows[0]);
}