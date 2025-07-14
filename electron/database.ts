import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config({ path: "electron/.env" });

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined, // Puerto por defecto de MySQL es 3306
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let pool: mysql.Pool;

export async function connectToDatabase(): Promise<void> {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    connection.release();
    console.log("Conexion a MySQL establecida con exito y pool creado!");
  } catch (error) {
    console.error("Error al conectar a la base de datos MySQL:", error);
    throw error;
  }
}

export async function executeQuery(sql: string, params?: any[]): Promise<any[]> {
  let connection: mysql.PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows as any[];
  } catch (error) {
    console.error("Error al ejecutar la consulta:", sql, error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function authenticateUser(username: string, password: string): Promise<any> {
  const sql = `
        SELECT
            u.usuario,
            u.password_hash,
            r.nombre AS rol_nombre
        FROM
            Usuarios AS u
        JOIN
            roles AS r ON u.rol_id = r.id
        WHERE
            u.usuario = ? AND u.password_hash = ?`;

  const rows = await executeQuery(sql, [username, password]);
  return rows[0] || null;
}
