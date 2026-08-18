import { pool } from '../config/db'
import bcrypt from 'bcryptjs'

export const runSeed = async () => {
  const client = await pool.connect()
  try {
    console.log('🌱 [SEED] Iniciando población de datos maestros en GEDASC...')
    await client.query('BEGIN')

    // 0. Limpieza de registros transaccionales / operativos del día a día
    console.log('🧹 [SEED] Limpiando registros operativos (ingresos, salidas, detalles de máquinas)...')
    await client.query(`
      DELETE FROM detalles_salida;
      DELETE FROM detalles_maquinas;
      DELETE FROM detalles_ingreso;
    `)

    // Reiniciar secuencias de auto-incremento operacionales
    await client.query(`
      SELECT pg_catalog.setval('detalles_ingreso_id_ingreso_seq', 1, false);
      SELECT pg_catalog.setval('detalles_salida_id_salida_seq', 1, false);
      SELECT pg_catalog.setval('detalles_maquinas_id_detallemaquina_seq', 1, false);
    `)

    // 1. Sembrar Roles Base
    console.log('🔹 Sembrando roles...')
    await client.query(`
      INSERT INTO roles (id_rol, nombre) VALUES
        (1, 'ADMIN'),
        (2, 'CELADOR')
      ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre;
    `)

    // 2. Sembrar Usuarios Iniciales
    console.log('🔹 Sembrando usuarios administrativos...')
    const adminPassHash = await bcrypt.hash('admin123', 10)
    const celadorPassHash = await bcrypt.hash('celador123', 10)

    await client.query(`
      INSERT INTO usuarios (nombre, email, password, id_rol) VALUES
        ('Administrador', 'admin@gedasc.com', $1, 1),
        ('Celador Turno Mañana', 'celador@gedasc.com', $2, 2)
      ON CONFLICT (email) DO UPDATE 
      SET nombre = EXCLUDED.nombre,
          password = EXCLUDED.password,
          id_rol = EXCLUDED.id_rol;
    `, [adminPassHash, celadorPassHash])

    // 3. Sembrar Programas Curriculares
    console.log('🔹 Sembrando programas curriculares...')
    await client.query(`
      INSERT INTO programa (id_programa, nombre_programa, version, nivel, estado) VALUES
        (1, 'Análisis y Desarrollo de Software', 'V1', 'Tecnólogo', 'activo'),
        (2, 'Gestión Empresarial', 'V1', 'Tecnólogo', 'activo')
      ON CONFLICT (id_programa) DO UPDATE 
      SET nombre_programa = EXCLUDED.nombre_programa,
          version = EXCLUDED.version,
          nivel = EXCLUDED.nivel,
          estado = EXCLUDED.estado;
    `)

    // 4. Sembrar Horarios Reutilizables y Días
    console.log('🔹 Sembrando horarios y días de funcionamiento...')
    await client.query(`
      INSERT INTO horario (id_horario, hora_inicio, hora_fin, jornada) VALUES
        (1, '07:00:00', '13:00:00', 'Mañana'),
        (2, '13:00:00', '18:00:00', 'Tarde'),
        (3, '18:00:00', '22:00:00', 'Noche')
      ON CONFLICT (id_horario) DO UPDATE 
      SET hora_inicio = EXCLUDED.hora_inicio,
          hora_fin = EXCLUDED.hora_fin,
          jornada = EXCLUDED.jornada;
    `)

    // Eliminar días previos de esos horarios para evitar duplicados y reinsertar
    await client.query(`DELETE FROM horario_dia WHERE id_horario IN (1, 2, 3);`)
    await client.query(`
      INSERT INTO horario_dia (id_horario, dia_semana) VALUES
        (1, 'Lunes'), (1, 'Martes'), (1, 'Miércoles'), (1, 'Jueves'), (1, 'Viernes'),
        (2, 'Lunes'), (2, 'Martes'), (2, 'Miércoles'), (2, 'Jueves'), (2, 'Viernes'),
        (3, 'Lunes'), (3, 'Martes'), (3, 'Miércoles'), (3, 'Jueves'), (3, 'Viernes');
    `)

    // 5. Sembrar Fichas / Formaciones
    console.log('🔹 Sembrando fichas de formación...')
    await client.query(`
      INSERT INTO formaciones (id_formacion, id_programa, id_horario, fecha_inicio, fecha_fin, estado) VALUES
        (2823456, 1, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 years', 'activa')
      ON CONFLICT (id_formacion) DO UPDATE 
      SET id_programa = EXCLUDED.id_programa,
          id_horario = EXCLUDED.id_horario,
          estado = EXCLUDED.estado;
    `)

    // 6. Sembrar Aprendices Base
    console.log('🔹 Sembrando aprendices base...')
    const aprendices = [
      ['1117784339', 'Jhonatan', 'Castro Calderón'],
      ['1051065897', 'Luis Esteban', 'Morales Gasca'],
      ['1117496648', 'Manuel Andres', 'Cardenas Suarez'],
      ['1006510328', 'Daniel Felipe', 'Vera Perdomo'],
      ['1118368446', 'Juan David', 'Trujillo Naranjo'],
      ['1117511568', 'Jhoan Steven', 'Zambrano Vera'],
      ['1118364706', 'Patrick Damian', 'Ortiz Hernández'],
      ['1117497987', 'Estefany', 'Cuellar Anturi'],
      ['1118471476', 'Jaiber Julian', 'Gutierrez Rivera'],
      ['1099742508', 'Jorge Alejandro', 'Peña Motta'],
      ['1116205722', 'Ingri Julieth', 'Gasca Tenorio'],
      ['1084331945', 'Andrés Julián', 'Cruz Hernández'],
      ['1006508852', 'Cristian', 'Cantillo Mejia'],
      ['1006508766', 'Ibsen Alexis', 'Soto Artunduaga'],
      ['1006419673', 'Brayan Stiven', 'Hoyos Cespedes'],
      ['1118367962', 'Santiago', 'Lizcano Suárez'],
      ['1115942896', 'Yefry', 'Serna Puentes'],
      ['1120498200', 'Anggie Marcela', 'Olmos Bernal'],
      ['1122726863', 'William Santiago', 'Barrero Romero'],
      ['1117512328', 'Yuleiny', 'Lugo Quimbayo'],
      ['1116204178', 'Paula Daniela', 'Cuellar Rondon'],
      ['1080361991', 'Juan Sebastian', 'Carvajal Home'],
      ['1088255893', 'Brayan Steven', 'Velázquez Roa'],
      ['1118471378', 'Leider Fabián', 'Ramos Cano'],
      ['1117513057', 'Yessica Yulieth', 'Jaramillo Herran'],
      ['1118367954', 'Gustavo Adolfo', 'Cabrera Vanegas'],
      ['1117811948', 'Emerson', 'Corredor Murcia'],
      ['1117931191', 'Sahira Mirleth', 'Vargas Sánchez'],
      ['1130268455', 'Mary Jane', 'Romero Rivas'],
      ['1118368430', 'Isabella', 'Lopera']
    ]

    for (const [doc, nom, ape] of aprendices) {
      await client.query(`
        INSERT INTO aprendiz (documento, nombre, apellido) VALUES ($1, $2, $3)
        ON CONFLICT (documento) DO UPDATE 
        SET nombre = EXCLUDED.nombre,
            apellido = EXCLUDED.apellido;
      `, [doc, nom, ape])
    }

    // 7. Designar Monitores
    console.log('🔹 Designando aprendices monitores...')
    await client.query(`
      UPDATE aprendiz SET es_monitor = TRUE WHERE documento IN ('1051065897', '1099742508');
    `)

    // 8. Asociar Aprendices a la Formación Activa
    console.log('🔹 Vinculando aprendices a la formación activa...')
    await client.query(`
      INSERT INTO aprendiz_formacion (id_aprendiz, id_formacion, estado)
      SELECT a.id_aprendiz, 2823456, 'activo'
      FROM aprendiz a
      WHERE NOT EXISTS (
        SELECT 1 FROM aprendiz_formacion af 
        WHERE af.id_aprendiz = a.id_aprendiz AND af.id_formacion = 2823456
      );
    `)

    await client.query('COMMIT')
    console.log('✅ [SEED] ¡Población de datos maestros completada exitosamente! El sistema está listo para operar desde cero.')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ [SEED] Error ejecutando la semilla:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  runSeed()
}
