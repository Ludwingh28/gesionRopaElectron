import mysql, { ResultSetHeader } from "mysql2/promise";
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
  const exists = await executeQuery("SELECT COUNT(*) as count FROM Usuarios WHERE usuario = ?", [data.usuario]);
  if (exists[0].count > 0) {
    return { success: false, error: "El usuario ya existe" };
  }
  // Insertar usuario
  const sql = `INSERT INTO Usuarios (nombre, usuario, email, telefono, password_hash, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, data.password_hash, data.rol_id, data.activo]);
  return { success: true };
}

export async function updateUser(data: any): Promise<any> {
  // Validar usuario único (excepto el propio)
  const exists = await executeQuery("SELECT COUNT(*) as count FROM Usuarios WHERE usuario = ? AND id != ?", [data.usuario, data.id]);
  if (exists[0].count > 0) {
    return { success: false, error: "El usuario ya existe" };
  }
  const sql = `UPDATE Usuarios SET nombre=?, usuario=?, email=?, telefono=?, password_hash=?, rol_id=?, activo=? WHERE id=?`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, data.password_hash, data.rol_id, data.activo, data.id]);
  return { success: true };
}

export async function getRoles(): Promise<any[]> {
  const sql = "SELECT * FROM roles ORDER BY nombre ASC";
  return await executeQuery(sql);
}

export async function getProducts(search = "") {
  let sql = `
    SELECT p.*, m.nombre AS marca, c.nombre AS categoria
    FROM productos p
    JOIN marcas m ON p.marca_id = m.id
    JOIN categorias c ON p.categoria_id = c.id`;
  const params: any[] = [];
  if (search) {
    sql += " WHERE p.detalle LIKE ? OR p.codigo_interno LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY p.id ASC";
  return await executeQuery(sql, params);
}

export async function createProduct(data: any) {
  const sql = `
    INSERT INTO productos (codigo_interno, detalle, marca_id, categoria_id, costo_compra, precio_venta_base, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  // Enviamos null para que el trigger lo genere
  await executeQuery(sql, [null, data.detalle, data.marca_id, data.categoria_id, data.costo_compra, data.precio_venta_base, data.activo]);
  return { success: true };
}

export async function updateProduct(data: any) {
  const sql = `
    UPDATE productos
    SET detalle=?, marca_id=?, categoria_id=?, costo_compra=?, precio_venta_base=?, activo=?
    WHERE id=?`;
  await executeQuery(sql, [data.detalle, data.marca_id, data.categoria_id, data.costo_compra, data.precio_venta_base, data.activo, data.id]);
  return { success: true };
}

export async function deleteProduct(id: number) {
  await executeQuery("DELETE FROM inventario WHERE producto_id = ?", [id]); // limpia inventario dependiente
  await executeQuery("DELETE FROM productos WHERE id = ?", [id]);
  return { success: true };
}

export async function getBrands() {
  return await executeQuery("SELECT id, nombre FROM marcas ORDER BY nombre");
}

export async function getCategories() {
  return await executeQuery("SELECT id, nombre FROM categorias ORDER BY nombre");
}

async function generarCodigoInterno(): Promise<string> {
  const [{ max }] = await executeQuery("SELECT MAX(id) AS max FROM productos");
  return `P${(max ?? 0) + 1}`.padStart(6, "0");
}

// Función para añadir un nuevo producto
export async function addNewProduct(data: { detalle: string; marca_id: number; categoria_id: number; costo_compra: number; precio_venta_base: number; activo: boolean }): Promise<any> {
  const sql = `
        INSERT INTO productos (codigo_interno, detalle, marca_id, categoria_id, costo_compra, precio_venta_base, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  await executeQuery(sql, [null, data.detalle, data.marca_id, data.categoria_id, data.costo_compra, data.precio_venta_base, data.activo]);
  return { success: true };
}

// Función para actualizar el precio de un producto (precio normal)
// Nota: El precio promocional se calcula automáticamente como 1.20 veces el precio normal.
export async function updateProductPrice(productId: number, newPrice: number): Promise<any> {
  const sql = "UPDATE productos SET precio_venta_base = ? WHERE id = ?";
  await executeQuery(sql, [newPrice, productId]);
  return { success: true };
}

// Funciones para gestionar las tallas disponibles

// Obtener todas las tallas disponibles
export async function getSizes(): Promise<any[]> {
  const sql = "SELECT * FROM tallas ORDER BY orden_display";
  return await executeQuery(sql);
}

// Añadir una nueva talla
export async function addSize(data: { nombre: string; orden_display?: number; activo?: boolean }): Promise<any> {
  const exists = await executeQuery("SELECT COUNT(*) as count FROM tallas WHERE nombre = ?", [data.nombre]);
  if (exists[0].count > 0) {
    return { success: false, error: "La talla ya existe" };
  }
  const sql = "INSERT INTO tallas (nombre, orden_display, activo) VALUES (?, ?, ?)";
  await executeQuery(sql, [data.nombre, data.orden_display || 0, data.activo !== undefined ? data.activo : true]);
  return { success: true };
}

// Actualizar una talla existente
export async function updateSize(data: { id: number; nombre: string; orden_display: number; activo: boolean }): Promise<any> {
  const exists = await executeQuery("SELECT COUNT(*) as count FROM tallas WHERE nombre = ? AND id != ?", [data.nombre, data.id]);
  if (exists[0].count > 0) {
    return { success: false, error: "La talla ya existe" };
  }
  const sql = "UPDATE tallas SET nombre = ?, orden_display = ?, activo = ? WHERE id = ?";
  await executeQuery(sql, [data.nombre, data.orden_display, data.activo, data.id]);
  return { success: true };
}

export async function createBrand(data: { nombre: string }): Promise<any> {
  const sql = "INSERT INTO marcas (nombre) VALUES (?)";
  const result = (await executeQuery(sql, [data.nombre])) as unknown as ResultSetHeader;
  return { id: result.insertId, success: true };
}

export async function createCategory(data: { nombre: string }): Promise<any> {
  const sql = "INSERT INTO categorias (nombre) VALUES (?)";
  const result = (await executeQuery(sql, [data.nombre])) as unknown as ResultSetHeader;
  return { id: result.insertId, success: true };
}
