CREATE DATABASE  IF NOT EXISTS `sistema_inventario` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sistema_inventario`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistema_inventario
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `v_ventas_detalle`
--

DROP TABLE IF EXISTS `v_ventas_detalle`;
/*!50001 DROP VIEW IF EXISTS `v_ventas_detalle`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_ventas_detalle` AS SELECT 
 1 AS `venta_id`,
 1 AS `numero_venta`,
 1 AS `fecha_venta`,
 1 AS `vendedor`,
 1 AS `rol_vendedor`,
 1 AS `cliente_nombre`,
 1 AS `total`,
 1 AS `metodo_pago`,
 1 AS `cantidad`,
 1 AS `precio_unitario`,
 1 AS `subtotal`,
 1 AS `producto`,
 1 AS `marca`,
 1 AS `talla`,
 1 AS `color`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_inventario_completo`
--

DROP TABLE IF EXISTS `v_inventario_completo`;
/*!50001 DROP VIEW IF EXISTS `v_inventario_completo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_inventario_completo` AS SELECT 
 1 AS `id`,
 1 AS `sku`,
 1 AS `codigo_interno`,
 1 AS `detalle`,
 1 AS `marca`,
 1 AS `categoria`,
 1 AS `talla`,
 1 AS `color`,
 1 AS `stock_actual`,
 1 AS `stock_minimo`,
 1 AS `costo_compra`,
 1 AS `precio_venta_base`,
 1 AS `precio_promotora`,
 1 AS `estado_stock`,
 1 AS `ubicacion`,
 1 AS `activo`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_ventas_detalle`
--

/*!50001 DROP VIEW IF EXISTS `v_ventas_detalle`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ventas_detalle` AS select `v`.`id` AS `venta_id`,`v`.`numero_venta` AS `numero_venta`,`v`.`fecha_venta` AS `fecha_venta`,`u`.`nombre` AS `vendedor`,`r`.`nombre` AS `rol_vendedor`,`v`.`cliente_nombre` AS `cliente_nombre`,`v`.`total` AS `total`,`v`.`metodo_pago` AS `metodo_pago`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`p`.`detalle` AS `producto`,`m`.`nombre` AS `marca`,`t`.`nombre` AS `talla`,`col`.`nombre` AS `color` from ((((((((`ventas` `v` join `usuarios` `u` on((`v`.`usuario_id` = `u`.`id`))) join `roles` `r` on((`u`.`rol_id` = `r`.`id`))) join `detalle_ventas` `dv` on((`v`.`id` = `dv`.`venta_id`))) join `inventario` `i` on((`dv`.`inventario_id` = `i`.`id`))) join `productos` `p` on((`i`.`producto_id` = `p`.`id`))) join `marcas` `m` on((`p`.`marca_id` = `m`.`id`))) join `tallas` `t` on((`i`.`talla_id` = `t`.`id`))) join `colores` `col` on((`i`.`color_id` = `col`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_inventario_completo`
--

/*!50001 DROP VIEW IF EXISTS `v_inventario_completo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_inventario_completo` AS select `i`.`id` AS `id`,`i`.`sku` AS `sku`,`p`.`codigo_interno` AS `codigo_interno`,`p`.`detalle` AS `detalle`,`m`.`nombre` AS `marca`,`c`.`nombre` AS `categoria`,`t`.`nombre` AS `talla`,`col`.`nombre` AS `color`,`i`.`stock_actual` AS `stock_actual`,`i`.`stock_minimo` AS `stock_minimo`,`p`.`costo_compra` AS `costo_compra`,`p`.`precio_venta_base` AS `precio_venta_base`,`p`.`precio_promotora` AS `precio_promotora`,(case when (`i`.`stock_actual` <= 0) then 'SIN STOCK' when (`i`.`stock_actual` <= `i`.`stock_minimo`) then 'STOCK BAJO' else 'STOCK OK' end) AS `estado_stock`,`i`.`ubicacion` AS `ubicacion`,`i`.`activo` AS `activo` from (((((`inventario` `i` join `productos` `p` on((`i`.`producto_id` = `p`.`id`))) join `marcas` `m` on((`p`.`marca_id` = `m`.`id`))) join `categorias` `c` on((`p`.`categoria_id` = `c`.`id`))) join `tallas` `t` on((`i`.`talla_id` = `t`.`id`))) join `colores` `col` on((`i`.`color_id` = `col`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Dumping events for database 'sistema_inventario'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `ev_limpieza_logs` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `ev_limpieza_logs` ON SCHEDULE EVERY 1 MONTH STARTS '2025-07-14 01:01:50' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    -- Eliminar movimientos de inventario mayores a 1 año
    DELETE FROM movimientos_inventario 
    WHERE fecha_movimiento < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Log de la limpieza
    INSERT INTO movimientos_inventario 
    (inventario_id, tipo_movimiento, cantidad, cantidad_anterior, 
     cantidad_nueva, motivo, usuario_id)
    VALUES 
    (1000, 'ajuste', 0, 0, 0, 'Limpieza automática de logs', 1);
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'sistema_inventario'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_verificar_stock_negativo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_verificar_stock_negativo`() RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_agregar_articulo_venta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agregar_articulo_venta`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_productos_stock_bajo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_productos_stock_bajo`()
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_realizar_venta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_realizar_venta`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte_productos_mas_vendidos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte_productos_mas_vendidos`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte_ventas_promotora` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte_ventas_promotora`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-19 18:28:54
