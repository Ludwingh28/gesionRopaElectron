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
            u.activo,
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

export async function getUsers(search: string = ""): Promise<any[]> {
  let sql = `
    SELECT u.id, u.nombre, u.usuario, u.email, u.telefono, u.password_hash, r.nombre AS rol_nombre, u.created_at, u.updated_at, u.activo
    FROM Usuarios AS u
    JOIN roles AS r ON u.rol_id = r.id
  `;
  const params: any[] = [];
  if (search) {
    sql += ` WHERE u.nombre LIKE ? OR u.usuario LIKE ? OR u.email LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ` ORDER BY u.nombre ASC`;
  return await executeQuery(sql, params);
}

export async function updateUserStatus(userId: number, activo: boolean): Promise<void> {
  const sql = `UPDATE Usuarios SET activo = ? WHERE id = ?`;
  await executeQuery(sql, [activo, userId]);
}

export async function createUser(data: any): Promise<any> {
  // Validar usuario único
  const exists = await executeQuery('SELECT COUNT(*) as count FROM Usuarios WHERE usuario = ?', [data.usuario]);
  if (exists[0].count > 0) {
    return { success: false, error: 'El usuario ya existe' };
  }
  // Insertar usuario
  const sql = `INSERT INTO Usuarios (nombre, usuario, email, telefono, password_hash, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, data.password_hash, data.rol_id, data.activo]);
  return { success: true };
}

export async function updateUser(data: any): Promise<any> {
  // Validar usuario único (excepto el propio)
  const exists = await executeQuery('SELECT COUNT(*) as count FROM Usuarios WHERE usuario = ? AND id != ?', [data.usuario, data.id]);
  if (exists[0].count > 0) {
    return { success: false, error: 'El usuario ya existe' };
  }
  const sql = `UPDATE Usuarios SET nombre=?, usuario=?, email=?, telefono=?, password_hash=?, rol_id=?, activo=? WHERE id=?`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, data.password_hash, data.rol_id, data.activo, data.id]);
  return { success: true };
}

export async function getRoles(): Promise<any[]> {
  const sql = 'SELECT * FROM roles ORDER BY nombre ASC';
  return await executeQuery(sql);
}
