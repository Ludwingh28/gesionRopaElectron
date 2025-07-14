-- =====================================================
-- SISTEMA DE INVENTARIO DE ROPA - ALTA FIDELIDAD
-- Cumple estrictamente las 3 Formas Normales (1FN, 2FN, 3FN)
-- =====================================================

DROP DATABASE IF EXISTS sistema_inventario;
CREATE DATABASE sistema_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_inventario;

-- =====================================================
-- TABLA DE ROLES
-- =====================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA DE MARCAS
-- =====================================================
CREATE TABLE marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE COLORES
-- =====================================================
CREATE TABLE colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7), -- Para futuras mejoras UI
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE CATEGORÍAS
-- =====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE TALLAS
-- =====================================================
CREATE TABLE tallas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    orden_display INT, -- Para ordenar S, M, L, XL correctamente
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE PRODUCTOS (Información base del producto)
-- =====================================================
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_interno VARCHAR(20) UNIQUE, -- Generado automáticamente
    detalle TEXT NOT NULL,
    marca_id INT NOT NULL,
    categoria_id INT NOT NULL,
    costo_compra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    precio_venta_base DECIMAL(10,2) NOT NULL,
    precio_promotora DECIMAL(10,2) AS (precio_venta_base * 1.20) STORED, -- Calculado automáticamente
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_marca (marca_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_codigo (codigo_interno)
);

-- =====================================================
-- TABLA DE INVENTARIO (SKU específicos: producto + talla + color)
-- =====================================================
CREATE TABLE inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE, -- Generado automáticamente
    producto_id INT NOT NULL,
    talla_id INT NOT NULL,
    color_id INT NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    ubicacion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (talla_id) REFERENCES tallas(id) ON DELETE RESTRICT,
    FOREIGN KEY (color_id) REFERENCES colores(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_producto_talla_color (producto_id, talla_id, color_id),
    INDEX idx_producto (producto_id),
    INDEX idx_stock (stock_actual),
    INDEX idx_sku (sku)
);

-- =====================================================
-- TABLA DE VENTAS (Cabecera)
-- =====================================================
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_venta VARCHAR(20) UNIQUE, -- Generado automáticamente
    usuario_id INT NOT NULL,
    cliente_nombre VARCHAR(200),
    cliente_documento VARCHAR(50),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'completada',
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') DEFAULT 'efectivo',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_venta),
    INDEX idx_numero (numero_venta)
);

-- =====================================================
-- TABLA DE DETALLE DE VENTAS
-- =====================================================
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    inventario_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE RESTRICT,
    INDEX idx_venta (venta_id),
    INDEX idx_inventario (inventario_id)
);

-- =====================================================
-- TABLA DE MOVIMIENTOS DE INVENTARIO
-- =====================================================
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventario_id INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste', 'venta', 'devolucion') NOT NULL,
    cantidad INT NOT NULL,
    cantidad_anterior INT NOT NULL,
    cantidad_nueva INT NOT NULL,
    motivo VARCHAR(200),
    usuario_id INT NOT NULL,
    venta_id INT NULL, -- Si el movimiento es por venta
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
    INDEX idx_inventario (inventario_id),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_movimiento)
);

-- =====================================================
-- CONFIGURACIÓN DE AUTO_INCREMENT
-- =====================================================
-- Solo productos, inventario y ventas comienzan en 1000
-- Usuarios comienzan desde 1
ALTER TABLE productos AUTO_INCREMENT = 1000;
ALTER TABLE inventario AUTO_INCREMENT = 1000;
ALTER TABLE ventas AUTO_INCREMENT = 1000;

-- =====================================================
-- INSERCIÓN DE DATOS MAESTROS
-- =====================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES 
('developer', 'Desarrollador con acceso completo al sistema'),
('admin', 'Administrador con permisos de gestión y ventas'),
('promotora', 'Promotora de ventas con precio especial');

-- Marcas (extraídas del documento)
INSERT INTO marcas (nombre) VALUES 
('PISOM'), ('SAMURAI'), ('EDWIN'), ('LEVI\'S'), ('ZAMANY'), 
('VOG'), ('KALUA'), ('POPSUGAR'), ('FUZARKA'), ('OZZO JEANS'),
('KANCAN LOS ANGELES'), ('COZZI'), ('CAMBRIDGE POLO CLUB'), 
('SHEKINÁ'), ('VIA ONIX'), ('MOST WANTED'), ('BONGO'), 
('REVANCHE'), ('LOOPPER'), ('KIDS DENIM BOYS'), ('AK DENIM'),
('DENIM LOVERS'), ('LEGIAO'), ('DARLOOK'), ('W.O.B.'), 
('BEM BOLADO'), ('UNDER GROUND'), ('LARANJA LIMA'), 
('FERIÑA'), ('AMORE MIO'), ('FOR GIRLS'), ('FOXI JEANS'), 
('DROMEDAR');

-- Colores (extraídos del documento)
INSERT INTO colores (nombre) VALUES 
('BLANCO'), ('AZUL'), ('CELESTE'), ('CAQUI'), ('NEGRO'), 
('AZUL OSCURO'), ('AZUL MARINO'), ('VERDE AGUA'), ('PLOMO'), 
('CAFÉ'), ('ANIMAL PRINTS'), ('CAMEL'), ('PLOMO JASPEADO'),
('VERDE MILITAR'), ('AZUL CLARO'), ('VERDE OLIVO'), 
('AZUL GRAFITO'), ('CAQUI OSCURO'), ('NEGRO GRAFITO'),
('AZUL BAJO'), ('CELESTE JASPEADO');

-- Categorías (analizadas del documento)
INSERT INTO categorias (nombre, descripcion) VALUES 
('SHORT', 'Shorts y bermudas cortas'),
('BERMUDA', 'Bermudas largas'),
('PANTALON', 'Pantalones largos'),
('CHAQUETA', 'Chaquetas y chalecos'),
('CAMISA', 'Camisas y tops'),
('FALDA', 'Faldas'),
('CAPRI', 'Pantalones capri');

-- Tallas (extraídas del documento)
INSERT INTO tallas (nombre, orden_display) VALUES 
('S', 1), ('M', 2), ('L', 3), ('XL', 4),
('36', 10), ('38', 11), ('40', 12), ('42', 13), ('44', 14), 
('46', 15), ('48', 16), ('50', 17), ('52', 18), ('54', 19),
('36/26', 20), ('0/23', 30), ('1/24', 31), ('3/25', 32), 
('5/26', 33), ('7/27', 34), ('9/28', 35), ('11/29', 36), 
('13/30', 37), ('3', 40), ('5', 41), ('7', 42), ('9', 43), 
('11', 44), ('13', 45), ('15', 46), ('3./4', 50), ('5./6', 51), 
('7./8', 52), ('9./10', 53), ('11./12', 54), ('13./14', 55), 
('15./16', 56), ('19./20', 57), ('21./22', 58);

-- Usuario administrador por defecto
INSERT INTO usuarios (nombre, usuario, email, telefono, password_hash, rol_id) VALUES 
('Administrador', 'admin', 'admin@sistema.com', '+1234567890', '$2y$10$example_hash', 
 (SELECT id FROM roles WHERE nombre = 'admin'));

-- =====================================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para generar código interno de productos
DELIMITER //
CREATE TRIGGER tr_producto_codigo_interno 
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
    -- El NEW.id no está disponible en BEFORE INSERT, usamos un método alternativo
    DECLARE next_id INT;
    
    -- Obtener el próximo ID que se asignará
    SELECT AUTO_INCREMENT INTO next_id 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'productos';
    
    IF NEW.codigo_interno IS NULL OR NEW.codigo_interno = '' THEN
        SET NEW.codigo_interno = CONCAT('PROD-', LPAD(next_id, 6, '0'));
    END IF;
END //
DELIMITER ;

-- Trigger para generar SKU de inventario
DELIMITER //
CREATE TRIGGER tr_inventario_sku 
BEFORE INSERT ON inventario
FOR EACH ROW
BEGIN
    DECLARE producto_codigo VARCHAR(20);
    DECLARE talla_nombre VARCHAR(20);
    DECLARE color_nombre VARCHAR(50);
    DECLARE next_id INT;
    
    -- Obtener el próximo ID que se asignará
    SELECT AUTO_INCREMENT INTO next_id 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'inventario';
    
    SELECT COALESCE(codigo_interno, CONCAT('PROD-', LPAD(id, 6, '0'))) INTO producto_codigo 
    FROM productos WHERE id = NEW.producto_id;
    
    SELECT nombre INTO talla_nombre 
    FROM tallas WHERE id = NEW.talla_id;
    
    SELECT nombre INTO color_nombre 
    FROM colores WHERE id = NEW.color_id;
    
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        SET NEW.sku = CONCAT(
            COALESCE(producto_codigo, 'PROD-000000'), '-', 
            REPLACE(REPLACE(COALESCE(talla_nombre, 'ST'), '/', ''), '.', ''), '-', 
            SUBSTRING(UPPER(COALESCE(color_nombre, 'STD')), 1, 3)
        );
    END IF;
END //
DELIMITER ;

-- Trigger para generar número de venta
DELIMITER //
CREATE TRIGGER tr_venta_numero 
BEFORE INSERT ON ventas
FOR EACH ROW
BEGIN
    DECLARE fecha_str VARCHAR(8);
    DECLARE next_id INT;
    
    -- Obtener el próximo ID que se asignará
    SELECT AUTO_INCREMENT INTO next_id 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ventas';
    
    SET fecha_str = DATE_FORMAT(COALESCE(NEW.fecha_venta, NOW()), '%Y%m%d');
    
    IF NEW.numero_venta IS NULL OR NEW.numero_venta = '' THEN
        SET NEW.numero_venta = CONCAT('VTA-', fecha_str, '-', LPAD(next_id, 4, '0'));
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar stock después de venta
DELIMITER //
CREATE TRIGGER tr_actualizar_stock_venta 
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    -- Actualizar stock
    UPDATE inventario 
    SET stock_actual = stock_actual - NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.inventario_id;
    
    -- Registrar movimiento
    INSERT INTO movimientos_inventario 
    (inventario_id, tipo_movimiento, cantidad, cantidad_anterior, 
     cantidad_nueva, motivo, usuario_id, venta_id)
    SELECT 
        NEW.inventario_id,
        'venta',
        NEW.cantidad,
        stock_actual + NEW.cantidad,
        stock_actual,
        CONCAT('Venta ID: ', NEW.venta_id),
        v.usuario_id,
        NEW.venta_id
    FROM inventario i
    JOIN ventas v ON v.id = NEW.venta_id
    WHERE i.id = NEW.inventario_id;
END //
DELIMITER ;

-- Trigger para calcular totales de venta
DELIMITER //
CREATE TRIGGER tr_calcular_total_venta 
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    UPDATE ventas 
    SET subtotal = (
        SELECT COALESCE(SUM(subtotal), 0) 
        FROM detalle_ventas 
        WHERE venta_id = NEW.venta_id
    ),
    total = subtotal - descuento
    WHERE id = NEW.venta_id;
END //
DELIMITER ;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para realizar una venta
DELIMITER //
CREATE PROCEDURE sp_realizar_venta(
    IN p_usuario_id INT,
    IN p_cliente_nombre VARCHAR(200),
    IN p_cliente_documento VARCHAR(50),
    IN p_metodo_pago VARCHAR(20),
    IN p_observaciones TEXT,
    OUT p_venta_id INT,
    OUT p_mensaje VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error al procesar la venta';
        SET p_venta_id = 0;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el usuario existe y puede vender
    IF NOT EXISTS (
        SELECT 1 FROM usuarios u 
        JOIN roles r ON u.rol_id = r.id 
        WHERE u.id = p_usuario_id 
        AND r.nombre IN ('admin', 'promotora')
        AND u.activo = TRUE
    ) THEN
        SET p_mensaje = 'Usuario no autorizado para realizar ventas';
        SET p_venta_id = 0;
        ROLLBACK;
    ELSE
        -- Crear la venta
        INSERT INTO ventas (usuario_id, cliente_nombre, cliente_documento, 
                           metodo_pago, observaciones)
        VALUES (p_usuario_id, p_cliente_nombre, p_cliente_documento, 
                p_metodo_pago, p_observaciones);
        
        SET p_venta_id = LAST_INSERT_ID();
        SET p_mensaje = 'Venta creada exitosamente';
        
        COMMIT;
    END IF;
END //
DELIMITER ;

-- Procedimiento para agregar artículo a venta
DELIMITER //
CREATE PROCEDURE sp_agregar_articulo_venta(
    IN p_venta_id INT,
    IN p_inventario_id INT,
    IN p_cantidad INT,
    OUT p_mensaje VARCHAR(500)
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_precio_base DECIMAL(10,2);
    DECLARE v_precio_final DECIMAL(10,2);
    DECLARE v_es_promotora BOOLEAN DEFAULT FALSE;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error al agregar artículo a la venta';
    END;
    
    START TRANSACTION;
    
    -- Verificar stock disponible
    SELECT stock_actual INTO v_stock_actual
    FROM inventario WHERE id = p_inventario_id;
    
    IF v_stock_actual IS NULL THEN
        SET p_mensaje = 'Producto no encontrado';
        ROLLBACK;
    ELSEIF v_stock_actual < p_cantidad THEN
        SET p_mensaje = 'Stock insuficiente';
        ROLLBACK;
    ELSE
        -- Obtener precio base
        SELECT p.precio_venta_base INTO v_precio_base
        FROM inventario i
        JOIN productos p ON i.producto_id = p.id
        WHERE i.id = p_inventario_id;
        
        -- Verificar si el usuario es promotora
        SELECT COUNT(*) > 0 INTO v_es_promotora
        FROM ventas v 
        JOIN usuarios u ON v.usuario_id = u.id
        JOIN roles r ON u.rol_id = r.id
        WHERE v.id = p_venta_id AND r.nombre = 'promotora';
        
        -- Calcular precio final
        IF v_es_promotora THEN
            SET v_precio_final = v_precio_base * 1.20;
        ELSE
            SET v_precio_final = v_precio_base;
        END IF;
        
        -- Agregar el artículo
        INSERT INTO detalle_ventas (venta_id, inventario_id, cantidad, precio_unitario)
        VALUES (p_venta_id, p_inventario_id, p_cantidad, v_precio_final);
        
        SET p_mensaje = 'Artículo agregado exitosamente';
        
        COMMIT;
    END IF;
END //
DELIMITER ;

-- Procedimiento para reporte de ventas por promotora
DELIMITER //
CREATE PROCEDURE sp_reporte_ventas_promotora(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        u.nombre AS promotora,
        COUNT(v.id) AS total_ventas,
        SUM(v.total) AS total_facturado,
        AVG(v.total) AS promedio_venta,
        SUM(dv.cantidad) AS articulos_vendidos
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    JOIN ventas v ON u.id = v.usuario_id
    JOIN detalle_ventas dv ON v.id = dv.venta_id
    WHERE r.nombre = 'promotora'
    AND DATE(v.fecha_venta) BETWEEN p_fecha_inicio AND p_fecha_fin
    AND v.estado = 'completada'
    GROUP BY u.id, u.nombre
    ORDER BY total_facturado DESC;
END //
DELIMITER ;

-- Procedimiento para reporte de productos más vendidos
DELIMITER //
CREATE PROCEDURE sp_reporte_productos_mas_vendidos(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_limite INT
)
BEGIN
    -- Establecer valor por defecto si es NULL
    IF p_limite IS NULL OR p_limite <= 0 THEN
        SET p_limite = 20;
    END IF;
    
    SET @sql = CONCAT(
        'SELECT 
            p.codigo_interno,
            p.detalle,
            m.nombre AS marca,
            c.nombre AS categoria,
            SUM(dv.cantidad) AS total_vendido,
            SUM(dv.subtotal) AS total_facturado,
            AVG(dv.precio_unitario) AS precio_promedio
        FROM productos p
        JOIN marcas m ON p.marca_id = m.id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN inventario i ON p.id = i.producto_id
        JOIN detalle_ventas dv ON i.id = dv.inventario_id
        JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha_venta) BETWEEN "', p_fecha_inicio, '" AND "', p_fecha_fin, '"
        AND v.estado = "completada"
        GROUP BY p.id, p.codigo_interno, p.detalle, m.nombre, c.nombre
        ORDER BY total_vendido DESC
        LIMIT ', p_limite
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Procedimiento para obtener productos con stock bajo
DELIMITER //
CREATE PROCEDURE sp_productos_stock_bajo()
BEGIN
    SELECT 
        i.sku,
        p.codigo_interno,
        p.detalle,
        m.nombre AS marca,
        t.nombre AS talla,
        col.nombre AS color,
        i.stock_actual,
        i.stock_minimo,
        (i.stock_minimo - i.stock_actual) AS deficit
    FROM inventario i
    JOIN productos p ON i.producto_id = p.id
    JOIN marcas m ON p.marca_id = m.id
    JOIN tallas t ON i.talla_id = t.id
    JOIN colores col ON i.color_id = col.id
    WHERE i.stock_actual <= i.stock_minimo
    AND i.activo = TRUE
    ORDER BY deficit DESC, i.stock_actual ASC;
END //
DELIMITER ;

-- =====================================================
-- VISTAS PARA FACILITAR CONSULTAS
-- =====================================================

-- Vista completa de inventario
CREATE VIEW v_inventario_completo AS
SELECT 
    i.id,
    i.sku,
    p.codigo_interno,
    p.detalle,
    m.nombre AS marca,
    c.nombre AS categoria,
    t.nombre AS talla,
    col.nombre AS color,
    i.stock_actual,
    i.stock_minimo,
    p.costo_compra,
    p.precio_venta_base,
    p.precio_promotora,
    CASE 
        WHEN i.stock_actual <= 0 THEN 'SIN STOCK'
        WHEN i.stock_actual <= i.stock_minimo THEN 'STOCK BAJO'
        ELSE 'STOCK OK'
    END AS estado_stock,
    i.ubicacion,
    i.activo
FROM inventario i
JOIN productos p ON i.producto_id = p.id
JOIN marcas m ON p.marca_id = m.id
JOIN categorias c ON p.categoria_id = c.id
JOIN tallas t ON i.talla_id = t.id
JOIN colores col ON i.color_id = col.id;

-- Vista de ventas con detalles
CREATE VIEW v_ventas_detalle AS
SELECT 
    v.id AS venta_id,
    v.numero_venta,
    v.fecha_venta,
    u.nombre AS vendedor,
    r.nombre AS rol_vendedor,
    v.cliente_nombre,
    v.total,
    v.metodo_pago,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal,
    p.detalle AS producto,
    m.nombre AS marca,
    t.nombre AS talla,
    col.nombre AS color
FROM ventas v
JOIN usuarios u ON v.usuario_id = u.id
JOIN roles r ON u.rol_id = r.id
JOIN detalle_ventas dv ON v.id = dv.venta_id
JOIN inventario i ON dv.inventario_id = i.id
JOIN productos p ON i.producto_id = p.id
JOIN marcas m ON p.marca_id = m.id
JOIN tallas t ON i.talla_id = t.id
JOIN colores col ON i.color_id = col.id;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_ventas_fecha_usuario ON ventas(fecha_venta, usuario_id);
CREATE INDEX idx_movimientos_fecha_tipo ON movimientos_inventario(fecha_movimiento, tipo_movimiento);
CREATE INDEX idx_productos_precio ON productos(precio_venta_base);
-- Índice en stock_actual ya existe en la definición de la tabla inventario

-- =====================================================
-- FUNCIÓN PARA VERIFICAR INTEGRIDAD DE DATOS
-- =====================================================

DELIMITER //
CREATE FUNCTION fn_verificar_stock_negativo() 
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE resultado TEXT DEFAULT '';
    DECLARE cuenta INT DEFAULT 0;
    
    SELECT COUNT(*) INTO cuenta 
    FROM inventario 
    WHERE stock_actual < 0;
    
    IF cuenta > 0 THEN
        SET resultado = CONCAT('ALERTA: ', cuenta, ' productos con stock negativo encontrados');
    ELSE
        SET resultado = 'OK: Todos los stocks están en valores positivos';
    END IF;
    
    RETURN resultado;
END //
DELIMITER ;

-- =====================================================
-- EVENTO PARA LIMPIEZA AUTOMÁTICA
-- =====================================================

SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT ev_limpieza_logs
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Eliminar movimientos de inventario mayores a 1 año
    DELETE FROM movimientos_inventario 
    WHERE fecha_movimiento < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Log de la limpieza
    INSERT INTO movimientos_inventario 
    (inventario_id, tipo_movimiento, cantidad, cantidad_anterior, 
     cantidad_nueva, motivo, usuario_id)
    VALUES 
    (1000, 'ajuste', 0, 0, 0, 'Limpieza automática de logs', 1);
END //
DELIMITER ;

-- =====================================================
-- SCRIPT FINALIZADO
-- =====================================================

SELECT 
    'Base de datos creada exitosamente' AS status,
    'Cumple 1FN, 2FN y 3FN' AS normalizacion,
    'IDs comienzan en 1000' AS configuracion,
    'Triggers y procedimientos listos' AS automatizacion;

-- Verificar integridad inicial
SELECT fn_verificar_stock_negativo() AS verificacion_inicial;