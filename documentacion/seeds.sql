-- Script de inserción de datos iniciales (Semillas)

-- 1. Insertar formación por defecto si no existe
INSERT INTO formaciones (nombre, nivel) 
VALUES ('Análisis y Desarrollo de Software', 'Tecnólogo')
ON CONFLICT (nombre) DO NOTHING;

-- Obtener el id de la formación insertada (asumiendo que es el primero o único por ahora)
-- Para este script usaremos el ID 1 directamente si la tabla fue limpiada.

-- 2. Insertar Aprendices
INSERT INTO aprendiz (documento, nombre, apellido, id_formacion) VALUES
('1117784339', 'Jhonatan', 'Castro Calderón', 1),
('1051065897', 'Luis Esteban', 'Morales Gasca', 1),
('1117496648', 'Manuel Andres', 'Cardenas Suarez', 1),
('1006510328', 'Daniel Felipe', 'Vera Perdomo', 1),
('1118368446', 'Juan David', 'Trujillo Naranjo', 1),
('1117511568', 'Jhoan Steven', 'Zambrano Vera', 1),
('1118364706', 'Patrick Damian', 'Ortiz Hernández', 1),
('1117497987', 'Estefany', 'Cuellar Anturi', 1),
('1118471476', 'Jaiber Julian', 'Gutierrez Rivera', 1),
('1099742508', 'Jorge Alejandro', 'Peña Motta', 1),
('1116205722', 'Ingri Julieth', 'Gasca Tenorio', 1),
('1084331945', 'Andrés Julián', 'Cruz Hernández', 1),
('1006508852', 'Cristian', 'Cantillo Mejia', 1),
('1006508766', 'Ibsen Alexis', 'Soto Artunduaga', 1),
('1006419673', 'Brayan Stiven', 'Hoyos Cespedes', 1),
('1118367962', 'Santiago', 'Lizcano Suárez', 1),
('1115942896', 'Yefry', 'Serna Puentes', 1),
('1120498200', 'Anggie Marcela', 'Olmos Bernal', 1),
('1122726863', 'William Santiago', 'Barrero Romero', 1),
('1117512328', 'Yuleiny', 'Lugo Quimbayo', 1),
('1116204178', 'Paula Daniela', 'Cuellar Rondon', 1),
('1080361991', 'Juan Sebastian', 'Carvajal Home', 1),
('1088255893', 'Brayan Steven', 'Velázquez Roa', 1),
('1118471378', 'Leider Fabián', 'Ramos Cano', 1),
('1117513057', 'Yessica Yulieth', 'Jaramillo Herran', 1),
('1118367954', 'Gustavo Adolfo', 'Cabrera Vanegas', 1),
('1117811948', 'Emerson', 'Corredor Murcia', 1),
('1117931191', 'Sahira Mirleth', 'Vargas Sánchez', 1),
('1130268455', 'Mary Jane', 'Romero Rivas', 1),
('1118368430', 'Isabella', 'Lopera', 1)
ON CONFLICT (documento) DO NOTHING;

-- 3. Insertar Usuarios Administrativos
-- Roles: 1 = ADMIN, 2 = CELADOR
INSERT INTO usuarios (nombre, email, password, id_rol) VALUES
('Administrador', 'admin@gedasc.com', '$2b$10$JZeitk51jbFy9MrlEVXhFOPzpYpvp0uhRfqR39PoX4Ij9ZQOjdw/i', 1),
('Celador Turno Mañana', 'celador@gedasc.com', '$2b$10$47E2jRGGV1RSXa6w0XztXeySxecPTM9pPL2KChGwgGd8tqOFDmd.6', 2)
ON CONFLICT (email) DO NOTHING;

-- Definir monitores por defecto
UPDATE aprendiz SET es_monitor = TRUE WHERE documento IN ('1051065897', '1099742508');
