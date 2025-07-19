import mysql, { ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";
import crypto from "crypto";

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

// Función para cifrar contraseñas con MD5
export function encryptPassword(password: string): string {
  return crypto.createHash("md5").update(password).digest("hex");
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
  const hashedPassword = encryptPassword(password);

  const sql = `
    SELECT
        u.id,
        u.nombre,
        u.usuario,
        u.email,
        u.password_hash,
        u.activo,
        r.nombre AS rol_nombre
    FROM
        usuarios AS u
    JOIN
        roles AS r ON u.rol_id = r.id
    WHERE
        u.usuario = ? AND u.password_hash = ?`;

  const rows = await executeQuery(sql, [username, hashedPassword]);
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

  // Cifrar la contraseña
  const hashedPassword = encryptPassword(data.password_hash);

  // Insertar usuario
  const sql = `INSERT INTO Usuarios (nombre, usuario, email, telefono, password_hash, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, hashedPassword, data.rol_id, data.activo]);
  return { success: true };
}

export async function updateUser(data: any): Promise<any> {
  // Validar usuario único (excepto el propio)
  const exists = await executeQuery("SELECT COUNT(*) as count FROM Usuarios WHERE usuario = ? AND id != ?", [data.usuario, data.id]);
  if (exists[0].count > 0) {
    return { success: false, error: "El usuario ya existe" };
  }
  // Cifrar la contraseña si se proporciona una nueva
  let hashedPassword = data.password_hash;
  if (data.password_hash && data.password_hash.trim() !== "") {
    hashedPassword = encryptPassword(data.password_hash);
  } else {
    // Si no se proporciona contraseña, mantener la actual
    const currentUser = await executeQuery("SELECT password_hash FROM Usuarios WHERE id = ?", [data.id]);
    hashedPassword = currentUser[0]?.password_hash;
  }

  const sql = `UPDATE Usuarios SET nombre=?, usuario=?, email=?, telefono=?, password_hash=?, rol_id=?, activo=? WHERE id=?`;
  await executeQuery(sql, [data.nombre, data.usuario, data.email, data.telefono, hashedPassword, data.rol_id, data.activo, data.id]);
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

// Función corregida para buscar producto por código interno
export async function getProductByCode(codigo: string): Promise<any> {
  const sql = `
    SELECT 
      p.id, p.codigo_interno, p.detalle, 
      CAST(p.precio_venta_base AS DECIMAL(10,2)) as precio_venta_base, 
      CAST(p.precio_promotora AS DECIMAL(10,2)) as precio_promotora,
      m.nombre AS marca, c.nombre AS categoria
    FROM productos p
    JOIN marcas m ON p.marca_id = m.id
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.codigo_interno = ? AND p.activo = TRUE
  `;
  const rows = await executeQuery(sql, [codigo]);

  if (rows.length === 0) return null;

  // Asegurar que los precios sean números
  const product = rows[0];
  return {
    ...product,
    precio_venta_base: Number(product.precio_venta_base) || 0,
    precio_promotora: Number(product.precio_promotora) || 0,
  };
}

// Función corregida para obtener inventario disponible de un producto
export async function getInventoryByProduct(productId: number): Promise<any[]> {
  const sql = `
    SELECT 
      i.id as inventario_id, i.sku, 
      CAST(i.stock_actual AS SIGNED) as stock_actual, 
      CAST(i.stock_minimo AS SIGNED) as stock_minimo,
      t.nombre AS talla, col.nombre AS color,
      p.detalle, 
      CAST(p.precio_venta_base AS DECIMAL(10,2)) as precio_venta_base, 
      CAST(p.precio_promotora AS DECIMAL(10,2)) as precio_promotora
    FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN tallas t ON i.talla_id = t.id
    JOIN colores col ON i.color_id = col.id
    WHERE i.producto_id = ? AND i.activo = TRUE AND i.stock_actual > 0
    ORDER BY t.orden_display, col.nombre
  `;
  const rows = await executeQuery(sql, [productId]);

  // Asegurar que los números sean números
  return rows.map((row) => ({
    ...row,
    stock_actual: Number(row.stock_actual) || 0,
    stock_minimo: Number(row.stock_minimo) || 0,
    precio_venta_base: Number(row.precio_venta_base) || 0,
    precio_promotora: Number(row.precio_promotora) || 0,
  }));
}

// Función para obtener lista completa de inventario
export async function getInventoryList(): Promise<any[]> {
  const sql = `
    SELECT 
      i.id,
      i.sku,
      i.producto_id,
      CAST(i.stock_actual AS SIGNED) as stock_actual,
      CAST(i.stock_minimo AS SIGNED) as stock_minimo,
      i.ubicacion,
      p.detalle,
      p.codigo_interno,
      m.nombre AS marca,
      c.nombre AS categoria,
      t.nombre AS talla,
      col.nombre AS color
    FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN marcas m ON p.marca_id = m.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN tallas t ON i.talla_id = t.id
    JOIN colores col ON i.color_id = col.id
    WHERE i.activo = TRUE
    ORDER BY p.codigo_interno, t.orden_display, col.nombre
  `;
  const rows = await executeQuery(sql);

  return rows.map((row) => ({
    ...row,
    stock_actual: Number(row.stock_actual) || 0,
    stock_minimo: Number(row.stock_minimo) || 0,
  }));
}

// Función para obtener todas las tallas
export async function getTallas(): Promise<any[]> {
  const sql = "SELECT id, nombre, orden_display FROM tallas WHERE activo = TRUE ORDER BY orden_display, nombre";
  return await executeQuery(sql);
}

// Función para obtener todos los colores
export async function getColores(): Promise<any[]> {
  const sql = "SELECT id, nombre FROM colores WHERE activo = TRUE ORDER BY nombre";
  return await executeQuery(sql);
}

// Función para crear item de inventario
export async function createInventoryItem(data: { producto_id: number; talla_id: number; color_id: number; stock_actual: number; stock_minimo: number; ubicacion?: string }): Promise<any> {
  // Verificar que no exista ya esta combinación
  const exists = await executeQuery("SELECT COUNT(*) as count FROM inventario WHERE producto_id = ? AND talla_id = ? AND color_id = ?", [data.producto_id, data.talla_id, data.color_id]);

  if (exists[0].count > 0) {
    return { success: false, error: "Ya existe inventario para esta combinación de producto, talla y color" };
  }

  const sql = `
    INSERT INTO inventario (producto_id, talla_id, color_id, stock_actual, stock_minimo, ubicacion, activo)
    VALUES (?, ?, ?, ?, ?, ?, TRUE)
  `;

  await executeQuery(sql, [data.producto_id, data.talla_id, data.color_id, data.stock_actual, data.stock_minimo, data.ubicacion || null]);

  return { success: true };
}

// Función para actualizar stock de inventario
export async function updateInventoryStock(inventarioId: number, newStock: number): Promise<any> {
  const sql = "UPDATE inventario SET stock_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
  await executeQuery(sql, [newStock, inventarioId]);
  return { success: true };
}

// Función para eliminar item de inventario
export async function deleteInventoryItem(inventarioId: number): Promise<any> {
  // Verificar que no haya ventas asociadas
  const hasSales = await executeQuery("SELECT COUNT(*) as count FROM detalle_ventas WHERE inventario_id = ?", [inventarioId]);

  if (hasSales[0].count > 0) {
    // Si hay ventas, solo desactivar
    await executeQuery("UPDATE inventario SET activo = FALSE WHERE id = ?", [inventarioId]);
  } else {
    // Si no hay ventas, eliminar completamente
    await executeQuery("DELETE FROM inventario WHERE id = ?", [inventarioId]);
  }

  return { success: true };
}

// Función para crear una nueva venta
export async function createSale(data: { usuario_id: number; cliente_nombre: string; cliente_documento: string; metodo_pago: string; observaciones?: string }): Promise<any> {
  const sql = `CALL sp_realizar_venta(?, ?, ?, ?, ?, @venta_id, @mensaje)`;
  await executeQuery(sql, [data.usuario_id, data.cliente_nombre, data.cliente_documento, data.metodo_pago, data.observaciones || ""]);

  // Obtener los valores de salida
  const result = await executeQuery("SELECT @venta_id as venta_id, @mensaje as mensaje");
  return result[0];
}

// Función para agregar item a una venta
export async function addItemToSale(data: { venta_id: number; inventario_id: number; cantidad: number }): Promise<any> {
  const sql = `CALL sp_agregar_articulo_venta(?, ?, ?, @mensaje)`;
  await executeQuery(sql, [data.venta_id, data.inventario_id, data.cantidad]);

  const result = await executeQuery("SELECT @mensaje as mensaje");
  return result[0];
}

// Función para obtener detalles completos de una venta (para voucher)
export async function getSaleDetails(ventaId: number): Promise<any> {
  const saleHeaderSql = `
    SELECT 
      v.id, v.numero_venta, v.fecha_venta, v.cliente_nombre, v.cliente_documento,
      v.subtotal, v.descuento, v.total, v.metodo_pago, v.observaciones,
      u.nombre AS vendedor, r.nombre AS rol_vendedor
    FROM ventas v
    JOIN usuarios u ON v.usuario_id = u.id
    JOIN roles r ON u.rol_id = r.id
    WHERE v.id = ?
  `;

  const saleDetailsSql = `
    SELECT 
      dv.cantidad, dv.precio_unitario, dv.subtotal,
      i.sku, p.codigo_interno, p.detalle,
      m.nombre AS marca, t.nombre AS talla, col.nombre AS color
    FROM detalle_ventas dv
    JOIN inventario i ON dv.inventario_id = i.id
    JOIN productos p ON i.producto_id = p.id
    JOIN marcas m ON p.marca_id = m.id
    JOIN tallas t ON i.talla_id = t.id
    JOIN colores col ON i.color_id = col.id
    WHERE dv.venta_id = ?
    ORDER BY dv.id
  `;

  const header = await executeQuery(saleHeaderSql, [ventaId]);
  const details = await executeQuery(saleDetailsSql, [ventaId]);

  return {
    header: header[0] || null,
    details: details,
  };
}

// Función para obtener datos del usuario autenticado
export async function getUserById(userId: number): Promise<any> {
  const sql = `
    SELECT 
      u.id, u.nombre, u.usuario, u.email,
      r.id as rol_id, r.nombre as rol_nombre
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.id = ?
  `;
  const rows = await executeQuery(sql, [userId]);
  return rows[0] || null;
}

// Función para obtener ventas del día (para admin)
export async function getVentasHoy(): Promise<{ totalVentas: number; totalPedidos: number }> {
  const hoy = new Date().toISOString().split("T")[0];

  try {
    const sql = `
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total), 0) as total_ventas
      FROM ventas 
      WHERE DATE(fecha_venta) = ? 
      AND estado = 'completada'
    `;

    const result = await executeQuery(sql, [hoy]);

    return {
      totalVentas: Number(result[0]?.total_ventas) || 0,
      totalPedidos: Number(result[0]?.total_pedidos) || 0,
    };
  } catch (error) {
    console.error("Error al obtener ventas del día:", error);
    return { totalVentas: 0, totalPedidos: 0 };
  }
}

// Función para obtener estadísticas de stock (para admin)
export async function getStockStats(): Promise<{ stockTotal: number; stockBajo: number }> {
  try {
    const sqlTotal = `
      SELECT COALESCE(SUM(stock_actual), 0) as stock_total
      FROM inventario 
      WHERE activo = TRUE
    `;

    const sqlBajo = `
      SELECT COUNT(*) as stock_bajo
      FROM inventario 
      WHERE stock_actual <= stock_minimo 
      AND activo = TRUE
    `;

    const [totalResult, bajoResult] = await Promise.all([executeQuery(sqlTotal), executeQuery(sqlBajo)]);

    return {
      stockTotal: Number(totalResult[0]?.stock_total) || 0,
      stockBajo: Number(bajoResult[0]?.stock_bajo) || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de stock:", error);
    return { stockTotal: 0, stockBajo: 0 };
  }
}

// Función para obtener ventas de una promotora en el mes (para promotoras)
export async function getVentasPromotoraMes(userId: number): Promise<{ totalVentas: number; totalGanancias: number }> {
  try {
    // Obtener primer y último día del mes actual
    const now = new Date();
    const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
    const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fechaInicio = primerDia.toISOString().split("T")[0];
    const fechaFin = ultimoDia.toISOString().split("T")[0];

    // SQL para calcular solo la comisión del 20% (diferencia entre precio promotora y precio base)
    const sql = `
      SELECT 
        COUNT(v.id) as total_ventas,
        COALESCE(SUM(
          dv.cantidad * (dv.precio_unitario - p.precio_venta_base)
        ), 0) as total_ganancias
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      JOIN roles r ON u.rol_id = r.id
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN inventario i ON dv.inventario_id = i.id
      JOIN productos p ON i.producto_id = p.id
      WHERE v.usuario_id = ?
      AND DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      AND r.nombre = 'promotora'
    `;

    const result = await executeQuery(sql, [userId, fechaInicio, fechaFin]);

    return {
      totalVentas: Number(result[0]?.total_ventas) || 0,
      totalGanancias: Number(result[0]?.total_ganancias) || 0,
    };
  } catch (error) {
    console.error("Error al obtener ventas de promotora:", error);
    return { totalVentas: 0, totalGanancias: 0 };
  }
}

// Función para obtener el resumen completo del dashboard
export async function getDashboardStats(userId: number, rolNombre: string): Promise<any> {
  try {
    if (rolNombre === "admin") {
      const [ventasHoy, stockStats] = await Promise.all([getVentasHoy(), getStockStats()]);

      return {
        ventasHoy: ventasHoy.totalVentas,
        pedidosHoy: ventasHoy.totalPedidos,
        stockTotal: stockStats.stockTotal,
        stockBajo: stockStats.stockBajo,
      };
    } else if (rolNombre === "promotora") {
      const ventasPromotora = await getVentasPromotoraMes(userId);

      return {
        ventasMes: ventasPromotora.totalVentas,
        gananciasMes: ventasPromotora.totalGanancias,
      };
    } else {
      // Developer o cualquier otro rol
      return {
        mensaje: "Acceso completo como desarrollador",
      };
    }
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    throw error;
  }
}

// Función para agregar stock a inventario existente
export async function addStockToInventory(inventarioId: number, cantidad: number, motivo: string, usuarioId: number): Promise<any> {
  try {
    // Obtener stock actual
    const currentStock = await executeQuery("SELECT stock_actual FROM inventario WHERE id = ?", [inventarioId]);
    if (currentStock.length === 0) {
      return { success: false, error: "Item de inventario no encontrado" };
    }

    const stockAnterior = currentStock[0].stock_actual;
    const stockNuevo = stockAnterior + cantidad;

    // Actualizar stock
    await executeQuery("UPDATE inventario SET stock_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [stockNuevo, inventarioId]);

    // Registrar movimiento
    await executeQuery(
      `
      INSERT INTO movimientos_inventario 
      (inventario_id, tipo_movimiento, cantidad, cantidad_anterior, cantidad_nueva, motivo, usuario_id)
      VALUES (?, 'entrada', ?, ?, ?, ?, ?)
    `,
      [inventarioId, cantidad, stockAnterior, stockNuevo, motivo, usuarioId]
    );

    return { success: true };
  } catch (error) {
    console.error("Error al agregar stock:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}

// Función para buscar productos con su inventario
export async function searchProductsWithInventory(search: string = ""): Promise<any[]> {
  let sql = `
    SELECT DISTINCT
      p.id, p.codigo_interno, p.detalle, 
      m.nombre AS marca, c.nombre AS categoria,
      p.precio_venta_base, p.precio_promotora
    FROM productos p
    JOIN marcas m ON p.marca_id = m.id
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = TRUE
  `;

  const params: any[] = [];
  if (search) {
    sql += " AND (p.detalle LIKE ? OR p.codigo_interno LIKE ? OR m.nombre LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY p.codigo_interno ASC";
  return await executeQuery(sql, params);
}

// Función para obtener inventario de un producto específico
export async function getProductInventoryDetails(productId: number): Promise<any[]> {
  const sql = `
    SELECT 
      i.id as inventario_id,
      i.sku,
      i.stock_actual,
      i.stock_minimo,
      t.nombre AS talla,
      col.nombre AS color,
      i.ubicacion
    FROM inventario i
    JOIN tallas t ON i.talla_id = t.id
    JOIN colores col ON i.color_id = col.id
    WHERE i.producto_id = ? AND i.activo = TRUE
    ORDER BY t.orden_display, col.nombre
  `;

  return await executeQuery(sql, [productId]);
}

// Función para obtener productos más vendidos
export async function getProductosMasVendidos(fechaInicio?: string, fechaFin?: string, limite: number = 20): Promise<any[]> {
  try {
    // Si no se proporcionan fechas, usar el mes actual
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    const sql = `
      SELECT 
        p.codigo_interno,
        p.detalle,
        m.nombre AS marca,
        c.nombre AS categoria,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.subtotal) AS total_facturado,
        AVG(dv.precio_unitario) AS precio_promedio,
        COUNT(DISTINCT v.id) AS numero_ventas
      FROM productos p
      JOIN marcas m ON p.marca_id = m.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN inventario i ON p.id = i.producto_id
      JOIN detalle_ventas dv ON i.id = dv.inventario_id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      GROUP BY p.id, p.codigo_interno, p.detalle, m.nombre, c.nombre
      ORDER BY total_vendido DESC
      LIMIT ?
    `;

    return await executeQuery(sql, [fechaInicio, fechaFin, limite]);
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    return [];
  }
}

// Función para obtener ranking de promotoras
export async function getRankingPromotoras(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    // Si no se proporcionan fechas, usar el mes actual
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    const sql = `
      SELECT 
        u.nombre AS promotora,
        u.email,
        COUNT(DISTINCT v.id) AS total_ventas,
        SUM(v.total) AS total_facturado,
        SUM(dv.cantidad) AS articulos_vendidos,
        AVG(v.total) AS promedio_venta,
        SUM(dv.cantidad * (dv.precio_unitario - p.precio_venta_base)) AS comision_ganada,
        MIN(v.fecha_venta) AS primera_venta,
        MAX(v.fecha_venta) AS ultima_venta
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      JOIN ventas v ON u.id = v.usuario_id
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN inventario i ON dv.inventario_id = i.id
      JOIN productos p ON i.producto_id = p.id
      WHERE r.nombre = 'promotora'
      AND DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      AND u.activo = TRUE
      GROUP BY u.id, u.nombre, u.email
      ORDER BY total_facturado DESC
    `;

    return await executeQuery(sql, [fechaInicio, fechaFin]);
  } catch (error) {
    console.error("Error al obtener ranking de promotoras:", error);
    return [];
  }
}

// Función para obtener comparativo de ventas mensuales
export async function getComparativoVentasMensuales(mesesAtras: number = 12): Promise<any[]> {
  try {
    const sql = `
      SELECT 
        YEAR(v.fecha_venta) AS año,
        MONTH(v.fecha_venta) AS mes,
        MONTHNAME(v.fecha_venta) AS nombre_mes,
        COUNT(DISTINCT v.id) AS total_ventas,
        SUM(v.total) AS total_facturado,
        SUM(dv.cantidad) AS articulos_vendidos,
        AVG(v.total) AS promedio_venta,
        COUNT(DISTINCT v.usuario_id) AS vendedores_activos
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      WHERE v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      AND v.estado = 'completada'
      GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)
      ORDER BY año DESC, mes DESC
    `;

    return await executeQuery(sql, [mesesAtras]);
  } catch (error) {
    console.error("Error al obtener comparativo de ventas:", error);
    return [];
  }
}

// Función para obtener análisis por categorías
export async function getAnalisisPorCategorias(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    const sql = `
      SELECT 
        c.nombre AS categoria,
        COUNT(DISTINCT p.id) AS productos_categoria,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.subtotal) AS total_facturado,
        AVG(dv.precio_unitario) AS precio_promedio,
        COUNT(DISTINCT v.id) AS numero_ventas
      FROM categorias c
      JOIN productos p ON c.id = p.categoria_id
      JOIN inventario i ON p.id = i.producto_id
      JOIN detalle_ventas dv ON i.id = dv.inventario_id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      GROUP BY c.id, c.nombre
      ORDER BY total_vendido DESC
    `;

    return await executeQuery(sql, [fechaInicio, fechaFin]);
  } catch (error) {
    console.error("Error al obtener análisis por categorías:", error);
    return [];
  }
}

// Función para obtener análisis por marcas
export async function getAnalisisPorMarcas(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    const sql = `
      SELECT 
        m.nombre AS marca,
        COUNT(DISTINCT p.id) AS productos_marca,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.subtotal) AS total_facturado,
        AVG(dv.precio_unitario) AS precio_promedio,
        COUNT(DISTINCT v.id) AS numero_ventas
      FROM marcas m
      JOIN productos p ON m.id = p.marca_id
      JOIN inventario i ON p.id = i.producto_id
      JOIN detalle_ventas dv ON i.id = dv.inventario_id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      GROUP BY m.id, m.nombre
      ORDER BY total_vendido DESC
    `;

    return await executeQuery(sql, [fechaInicio, fechaFin]);
  } catch (error) {
    console.error("Error al obtener análisis por marcas:", error);
    return [];
  }
}

// Función para obtener reporte de inventario crítico
export async function getReporteInventarioCritico(): Promise<any[]> {
  try {
    const sql = `
      SELECT 
        i.sku,
        p.codigo_interno,
        p.detalle,
        m.nombre AS marca,
        c.nombre AS categoria,
        t.nombre AS talla,
        col.nombre AS color,
        i.stock_actual,
        i.stock_minimo,
        (i.stock_minimo - i.stock_actual) AS deficit,
        p.precio_venta_base,
        (i.stock_minimo - i.stock_actual) * p.costo_compra AS valor_reposicion_sugerida
      FROM inventario i
      JOIN productos p ON i.producto_id = p.id
      JOIN marcas m ON p.marca_id = m.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN tallas t ON i.talla_id = t.id
      JOIN colores col ON i.color_id = col.id
      WHERE i.stock_actual <= i.stock_minimo
      AND i.activo = TRUE
      ORDER BY deficit DESC, valor_reposicion_sugerida DESC
    `;

    return await executeQuery(sql);
  } catch (error) {
    console.error("Error al obtener reporte de inventario crítico:", error);
    return [];
  }
}

// Función para obtener ventas por métodos de pago
export async function getVentasPorMetodoPago(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    const sql = `
      SELECT 
        metodo_pago,
        COUNT(*) AS numero_transacciones,
        SUM(total) AS total_facturado,
        AVG(total) AS promedio_transaccion,
        MIN(total) AS minimo_transaccion,
        MAX(total) AS maximo_transaccion
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
      AND estado = 'completada'
      GROUP BY metodo_pago
      ORDER BY total_facturado DESC
    `;

    return await executeQuery(sql, [fechaInicio, fechaFin]);
  } catch (error) {
    console.error("Error al obtener ventas por método de pago:", error);
    return [];
  }
}

// Función para obtener resumen ejecutivo de reportes
export async function getResumenEjecutivo(fechaInicio?: string, fechaFin?: string): Promise<any> {
  try {
    if (!fechaInicio || !fechaFin) {
      const now = new Date();
      const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fechaInicio = primerDia.toISOString().split("T")[0];
      fechaFin = ultimoDia.toISOString().split("T")[0];
    }

    // Obtener estadísticas generales
    const sqlGeneral = `
      SELECT 
        COUNT(DISTINCT v.id) AS total_ventas,
        SUM(v.total) AS total_facturado,
        AVG(v.total) AS promedio_venta,
        SUM(dv.cantidad) AS articulos_vendidos,
        COUNT(DISTINCT v.usuario_id) AS vendedores_activos,
        COUNT(DISTINCT p.id) AS productos_vendidos
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN inventario i ON dv.inventario_id = i.id
      JOIN productos p ON i.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
    `;

    // Obtener top 3 productos
    const sqlTopProductos = `
      SELECT p.detalle, SUM(dv.cantidad) AS cantidad
      FROM productos p
      JOIN inventario i ON p.id = i.producto_id
      JOIN detalle_ventas dv ON i.id = dv.inventario_id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      GROUP BY p.id, p.detalle
      ORDER BY cantidad DESC
      LIMIT 3
    `;

    // Obtener top 3 promotoras
    const sqlTopPromotoras = `
      SELECT u.nombre, SUM(v.total) AS total
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      JOIN ventas v ON u.id = v.usuario_id
      WHERE r.nombre = 'promotora'
      AND DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 'completada'
      GROUP BY u.id, u.nombre
      ORDER BY total DESC
      LIMIT 3
    `;

    const [general, topProductos, topPromotoras] = await Promise.all([
      executeQuery(sqlGeneral, [fechaInicio, fechaFin]),
      executeQuery(sqlTopProductos, [fechaInicio, fechaFin]),
      executeQuery(sqlTopPromotoras, [fechaInicio, fechaFin]),
    ]);

    return {
      periodo: { fechaInicio, fechaFin },
      estadisticas: general[0] || {},
      topProductos: topProductos,
      topPromotoras: topPromotoras,
    };
  } catch (error) {
    console.error("Error al obtener resumen ejecutivo:", error);
    return null;
  }
}
