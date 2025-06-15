CREATE DATABASE LupitaDB;

USE LupitaDB;

CREATE TABLE Rol (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    nombreS VARCHAR(50) NULL,
    apellidoP VARCHAR(70) NOT NULL,
    apellidoM VARCHAR(70) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100) NOT NULL,
    idRol INT NOT NULL,
    FOREIGN KEY (idRol) REFERENCES Rol(id)
);

INSERT INTO Rol (nombre) VALUES ('developer'), ('gerente'), ('promotora');

INSERT INTO Usuario (nombre, apellidoP, apellidoM, usuario, contrasena, telefono, email, idRol)
SELECT 'Admin', 'Developer', 'Test', 'admin', 'password123', '123456789', 'admin@example.com', id
FROM Rol
WHERE nombre = 'developer';