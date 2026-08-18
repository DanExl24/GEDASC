// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { checkDuplicate } from '../services/machines/checkDuplicate';
import { checkVehicle } from '../services/machines/checkVehicle';
import { checkComputer } from '../services/machines/checkComputer';
import { checkMachineResult } from '../types/InconsistentMachine.types';
import { QueryBuilder } from '../utils/queryBuilder.util';
import { searchGlobal } from '../utils/search.util';
import { buildQuery } from '../utils/queryBuilder.util';
// Funcion para el ingreso de aprendiz
/**
 * @swagger
 * /api/registroIngresos/addEntry/{documento}:
 *   post:
 *     summary: Registrar el ingreso de un aprendiz
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingreso registrado exitosamente
 */
export const AddEntry = async (req: Request, res: Response) => {
  console.log("Documento recibido:", req.params.documento);
  try {

    // traer documento
    const documento = req.params.documento;

    if (!documento)
      return res.status(400).json({ message: "Datos invalidos" });


    // Obtener el aprendiz por documento
    const aprendizRecord = await pool.query(
      'SELECT id_aprendiz FROM aprendiz WHERE documento = $1',[documento]);

    // verificar si el aprendiz si esta en la base de datos
    if (aprendizRecord.rowCount == 0) {
      return res.status(404).json({ message: "Aprendiz no encontrado" });
    }

    // traer el id del aprendiz
    const id_aprendiz = aprendizRecord.rows[0].id_aprendiz;

    // 1️⃣ Verificar si tiene sesión activa (ingreso sin salida)
    const activeSessionQuery = await pool.query(`
      SELECT di.id_ingreso
      FROM detalles_ingreso di
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      WHERE di.id_aprendiz = $1 AND ds.hora_salida IS NULL
      ORDER BY di.hora_ingreso DESC
      LIMIT 1
    `, [id_aprendiz]);

    if (activeSessionQuery.rowCount! > 0) {
      // 2️⃣ Registrar salida automáticamente para cerrar la sesión activa
      const id_ingreso = activeSessionQuery.rows[0].id_ingreso;
      const result = await pool.query(
        'INSERT INTO detalles_salida (id_ingreso) VALUES ($1) RETURNING *',
        [id_ingreso]
      );
      return res.status(200).json({
        type: 'exit',
        message: 'Salida registrada con éxito',
        data: result.rows[0]
      });
    }

    const { tipo_sesion, motivo_reingreso, id_formacion, motivo_visita } = req.body;

    // 3️⃣ Registrar un nuevo ingreso
    const result = await pool.query(
      'INSERT INTO detalles_ingreso (id_aprendiz, tipo_sesion, motivo_reingreso, id_formacion, motivo_visita) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_aprendiz, tipo_sesion || 'formacion', motivo_reingreso || null, id_formacion || null, motivo_visita || null]
    );

    // mandar resultados
    return res.status(201).json({
      type: 'entry',
      message: 'Ingreso registrado con éxito',
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Hay un error" });
  }
};


// Funcion para verificar el ingreso de un aprendiz
/**
 * @swagger
 * /api/registroIngresos/verificarEntrada/{documento}:
 *   get:
 *     summary: Verificar si un aprendiz ya ingresó hoy
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado del ingreso
 */
export const DetectEntry = async (request: Request, response: Response) => {
  try {
    const { documento } = request.params;

    // 1️⃣ Verificar si el aprendiz existe
    const aprendiz = await pool.query(
      `SELECT id_aprendiz, es_monitor FROM aprendiz WHERE documento = $1`,
      [documento]
    );

    if (aprendiz.rowCount === 0) {
      return response.status(404).json({
        message: "El documento no existe en la base de datos"
      });
    }

    const id_aprendiz = aprendiz.rows[0].id_aprendiz;
    const es_monitor = aprendiz.rows[0].es_monitor;

    // 2️⃣ Verificar si tiene una sesión activa (ingreso sin salida hoy)
    const activeSessionQuery = await pool.query(`
      SELECT 
        di.id_ingreso, 
        di.id_detallemaquina, 
        dm.estado_equipo,
        di.id_formacion,
        h.hora_fin,
        TO_CHAR(h.hora_fin, 'HH12:MI AM') AS hora_fin_formateada,
        (CURRENT_TIME < (h.hora_fin - INTERVAL '30 minutes')) AS es_salida_anticipada
      FROM detalles_ingreso di
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      LEFT JOIN detalles_maquinas dm ON dm.id_detallemaquina = di.id_detallemaquina
      LEFT JOIN formaciones f ON f.id_formacion = di.id_formacion
      LEFT JOIN horario h ON h.id_horario = f.id_horario
      WHERE di.id_aprendiz = $1 
        AND ds.hora_salida IS NULL
        AND di.hora_ingreso >= CURRENT_DATE
      ORDER BY di.hora_ingreso DESC
      LIMIT 1
    `, [id_aprendiz]);

    if (activeSessionQuery.rowCount && activeSessionQuery.rowCount > 0) {
      const session = activeSessionQuery.rows[0];
      const hasMachine = session.id_detallemaquina !== null && session.estado_equipo === 'dentro';
      const isEarlyExit = Boolean(session.es_salida_anticipada && session.hora_fin);

      return response.status(200).json({
        message: "El aprendiz tiene una sesión activa. Registrando salida.",
        yaIngresado: true,
        activeSession: true,
        es_monitor,
        hasMachine,
        id_detallemaquina: session.id_detallemaquina,
        id_ingreso: session.id_ingreso,
        id_aprendiz,
        isEarlyExit,
        hora_fin: session.hora_fin_formateada || null
      });
    }

    // 3️⃣ Verificar si tiene al menos un ingreso hoy (es decir, ya completó una sesión hoy y está reingresando)
    const reentryQuery = await pool.query(`
      SELECT COUNT(*) AS total_hoy
      FROM detalles_ingreso
      WHERE id_aprendiz = $1
        AND hora_ingreso >= CURRENT_DATE
        AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `, [id_aprendiz]);

    const total_hoy = parseInt(reentryQuery.rows[0].total_hoy, 10);
    const isReentry = total_hoy > 0;

    // 3.5️⃣ Verificar horarios de formaciones activas del aprendiz
    const schedulesQuery = await pool.query(`
      SELECT 
        f.id_formacion,
        f.id_formacion::text AS nombre_ficha,
        p.nombre_programa,
        h.hora_inicio,
        h.hora_fin,
        h.jornada,
        (
          CURRENT_TIME >= (h.hora_inicio - INTERVAL '30 minutes') 
          AND CURRENT_TIME <= (h.hora_fin + INTERVAL '30 minutes')
          AND hd.dia_semana = CASE EXTRACT(ISODOW FROM CURRENT_TIMESTAMP)
              WHEN 1 THEN 'Lunes'
              WHEN 2 THEN 'Martes'
              WHEN 3 THEN 'Miércoles'
              WHEN 4 THEN 'Jueves'
              WHEN 5 THEN 'Viernes'
              WHEN 6 THEN 'Sábado'
              WHEN 7 THEN 'Domingo'
          END
        ) AS coincide_horario
      FROM aprendiz_formacion af
      JOIN formaciones f ON f.id_formacion = af.id_formacion
      JOIN programa p ON p.id_programa = f.id_programa
      JOIN horario h ON h.id_horario = f.id_horario
      JOIN horario_dia hd ON hd.id_horario = h.id_horario
      WHERE af.id_aprendiz = $1 AND af.estado = 'activo' AND f.estado = 'activa'
    `, [id_aprendiz]);

    const uniqueFormationsMap = new Map();
    schedulesQuery.rows.forEach(row => {
      if (!uniqueFormationsMap.has(row.id_formacion)) {
        uniqueFormationsMap.set(row.id_formacion, {
          id_formacion: row.id_formacion,
          nombre_ficha: row.nombre_ficha,
          nombre_programa: row.nombre_programa,
          hora_inicio: row.hora_inicio,
          hora_fin: row.hora_fin,
          jornada: row.jornada
        });
      }
    });
    const allActiveFormations = Array.from(uniqueFormationsMap.values());

    const matchingFormations = schedulesQuery.rows
      .filter(row => row.coincide_horario)
      .map(row => ({
        id_formacion: row.id_formacion,
        nombre_ficha: row.nombre_ficha,
        nombre_programa: row.nombre_programa,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        jornada: row.jornada
      }));

    const isWithinSchedule = matchingFormations.length > 0;

    // 4️⃣ Todo bien, puede ingresar (crear nueva sesión)
    return response.status(200).json({
      message: "El aprendiz puede ingresar",
      yaIngresado: false,
      activeSession: false,
      isReentry,
      es_monitor,
      id_aprendiz,
      schedule: {
        isWithinSchedule,
        matchingFormations,
        allActiveFormations
      }
    });

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      message: "Hay un error",
      error: error
    });
  }
};



// Funcion para el historial de ingresos
/**
 * @swagger
 * /api/registroIngresos/historial:
 *   get:
 *     summary: Obtener historial de ingresos de hoy
 *     tags: [RegistroIngresos]
 *     responses:
 *       200:
 *         description: Lista de ingresos hoy
 */
export const EntryRecord = async (request: Request, response: Response) => {
  try {

    const queryConfig: QueryBuilder = {
      select: [
        'a.id_aprendiz',
        'a.nombre',
        'a.apellido',
        'a.documento',
        'a.es_monitor',
        "COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion",
        'p.nombre_programa',
        'f.id_formacion AS id_formacion',
        'di.motivo_visita',
        `TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso`,
        'di.id_detallemaquina',
        'di.tipo_sesion',
        'di.motivo_reingreso',
        `TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida`,
        '(SELECT COUNT(*) FROM aprendiz_formacion apf WHERE apf.id_aprendiz = a.id_aprendiz AND apf.estado = \'activo\') AS total_formaciones',
        'ROW_NUMBER() OVER (PARTITION BY di.id_aprendiz, di.hora_ingreso::date ORDER BY di.id_ingreso ASC) AS numero_sesion'
      ],
      from: 'detalles_ingreso di',
      joins: [
        'JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz',
        `LEFT JOIN (
          SELECT id_aprendiz, id_formacion
          FROM (
            SELECT id_aprendiz, id_formacion,
                   ROW_NUMBER() OVER (PARTITION BY id_aprendiz ORDER BY id_formacion DESC) as rn
            FROM aprendiz_formacion
            WHERE estado = 'activo'
          ) sub
          WHERE rn = 1
        ) af_fallback ON af_fallback.id_aprendiz = di.id_aprendiz AND di.id_formacion IS NULL`,
        "LEFT JOIN formaciones f ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)",
        "LEFT JOIN programa p ON p.id_programa = f.id_programa",
        'LEFT JOIN detalles_maquinas dm ON dm.id_detallemaquina = di.id_detallemaquina',
        'LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso'
      ],
      where: [
        `di.hora_ingreso >= CURRENT_DATE`,
        `di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'`
      ],
      orderBy: 'di.id_ingreso DESC'
    }

    const { text, values } = buildQuery(queryConfig)

    const result = await pool.query(text, values)

    if (result.rowCount === 0) {
      return response.status(200).json([]);
    }

    return response.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      message: "Hay un error en el servidor",
      error
    });
  }
};


// Funcion para traer los datos del aprendiz
/**
 * @swagger
 * /api/registroIngresos/ingresoManual/{documento}:
 *   get:
 *     summary: Preparar ingreso manual capturando datos del aprendiz
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del aprendiz para ingreso manual
 */
export const EntryManual = async (request: Request, response : Response) =>{
  try {
    const { documento } = request.params
    // Obtener el aprendiz por documento y consolidar sus programas de formación
    const aprendizRecord = await pool.query(
      `SELECT 
         a.id_aprendiz,
         a.nombre, 
         a.apellido, 
         COALESCE(
           STRING_AGG(DISTINCT p.nombre_programa, ' / '),
           'Sin formación asignada'
         ) AS formacion 
       FROM aprendiz AS a  
       LEFT JOIN aprendiz_formacion AS af ON af.id_aprendiz = a.id_aprendiz AND af.estado = 'activo'
       LEFT JOIN formaciones AS f ON f.id_formacion = af.id_formacion 
       LEFT JOIN programa AS p ON p.id_programa = f.id_programa
       WHERE a.documento = $1
       GROUP BY a.id_aprendiz, a.nombre, a.apellido`,
      [documento]
    );

    // verificar si el aprendiz si esta en la base de datos
    if (aprendizRecord.rowCount === 0) {
      return response.status(404).json({ message: "Aprendiz no encontrado" });
    }
    const result = aprendizRecord.rows[0]
    response.status(200).json({ result })
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error al consultar aprendiz" });
  }
}


// Funcion para la busqueda de un aprendiz
/**
 * @swagger
 * /api/registroIngresos/buscar:
 *   get:
 *     summary: Buscar aprendiz por nombre o documento
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 */
export const SearchAprendiz = async (request: Request, response: Response) => {
  try {
    const text = (request.query.q as string)?.trim()

    if (!text) {
      return response.status(400).json({
        message: "Debe escribir algo"
      })
    }

    const queryConfig: QueryBuilder = {
      select: [
        'a.id_aprendiz',
        'a.nombre',
        'a.apellido',
        'a.documento',
        'a.es_monitor',
        "COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion",
        'p.nombre_programa',
        'f.id_formacion AS id_formacion',
        'di.motivo_visita',
        `TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso`,
        'di.id_detallemaquina',
        'di.tipo_sesion',
        'di.motivo_reingreso',
        `TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida`,
        '(SELECT COUNT(*) FROM aprendiz_formacion apf WHERE apf.id_aprendiz = a.id_aprendiz AND apf.estado = \'activo\') AS total_formaciones',
        'ROW_NUMBER() OVER (PARTITION BY di.id_aprendiz, di.hora_ingreso::date ORDER BY di.id_ingreso ASC) AS numero_sesion'
      ],
      from: 'detalles_ingreso di',
      joins: [
        'JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz',
        `LEFT JOIN (
          SELECT id_aprendiz, id_formacion
          FROM (
            SELECT id_aprendiz, id_formacion,
                   ROW_NUMBER() OVER (PARTITION BY id_aprendiz ORDER BY id_formacion DESC) as rn
            FROM aprendiz_formacion
            WHERE estado = 'activo'
          ) sub
          WHERE rn = 1
        ) af_fallback ON af_fallback.id_aprendiz = di.id_aprendiz AND di.id_formacion IS NULL`,
        "LEFT JOIN formaciones f ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)",
        "LEFT JOIN programa p ON p.id_programa = f.id_programa",
        'LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso'
      ],
      where: [
        `di.hora_ingreso >= CURRENT_DATE`,
        `di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'`
      ]
    }

    const rows = await searchGlobal(
      pool,
      queryConfig,
      text,
      ['a.documento', 'a.nombre', 'a.apellido']
    )

    console.log("Busqueda:", text)

    response.status(200).json(rows)

  } catch (error) {
    console.error(error)

    response.status(500).json({
      message: "Error en la busqueda"
    })
  }
}

/**
 * @swagger
 * /api/registroIngresos/maquinaPrincipal/{id_aprendiz}:
 *   get:
 *     summary: Consultar máquina principal vinculada al aprendiz
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: id_aprendiz
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la máquina principal
 */
export const SearchPrincipalMachine = async (request: Request, response: Response) => {
  const { id_aprendiz } = request.params

  if (!id_aprendiz) {
    return response.status(400).json({
      message: "Debe enviar el id del aprendiz"
    })
  }

  try {
    console.log('[PrincipalMachine][API] Consultando maquina principal para aprendiz:', id_aprendiz)
    const [computerResult, vehicleResult] = await Promise.all([
      pool.query(
        `
        SELECT
          c.marca,
          c.serial
        FROM aprendiz_computador ac
        INNER JOIN computadores c
          ON c.id_computador = ac.id_computador
        WHERE ac.id_aprendiz = $1
          AND ac.principal = true
        ORDER BY ac.fecha_asignacion DESC
        LIMIT 1
        `,
        [id_aprendiz]
      ),
      pool.query(
        `
        SELECT
          v.tipo_vehiculo,
          v.modelo AS marca,
          v.placa
        FROM aprendiz_vehiculo av
        INNER JOIN vehiculos v
          ON v.id_vehiculo = av.id_vehiculo
        WHERE av.id_aprendiz = $1
          AND av.principal = true
        ORDER BY av.fecha_asignacion DESC
        LIMIT 1
        `,
        [id_aprendiz]
      )
    ])

    const result = {
      pc: computerResult.rows[0]
        ? {
            marca: computerResult.rows[0].marca ?? null,
            serial: computerResult.rows[0].serial ?? null
          }
        : null,
      vh: vehicleResult.rows[0]
        ? {
            tipo_vehiculo: vehicleResult.rows[0].tipo_vehiculo ?? null,
            marca: vehicleResult.rows[0].marca ?? null,
            placa: vehicleResult.rows[0].placa ?? null
          }
        : null
    }

    console.log('[PrincipalMachine][API] Resultado encontrado:', {
      id_aprendiz,
      result
    })

    return response.status(200).json(result)
  } catch (error) {
    console.error(error)

    return response.status(500).json({
      message: "Error al consultar la maquina principal",
      error
    })
  }
}


// Funcion para ingresar la maquina del aprendiz
/**
 * @swagger
 * /api/registroIngresos/ingresoMaquina/{id}:
 *   post:
 *     summary: Registrar ingreso de una máquina/vehículo
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               datos:
 *                 type: object
 *     responses:
 *       200:
 *         description: Máquina registrada
 */
export const AddMachine = async (request: Request, response: Response) => {
  const client = await pool.connect();

  try {
    const id_aprendiz = request.params.id;

    const {
      tipoMaquina,
      tipoVehiculo,
      modelo,
      placaSerial,
      firma,
      forzarExcepcion
    } = request.body;

    // 🔤 normalización y autogeneración para vehículos ligeros (bicicleta, patineta)
    const isLightVehicle = tipoMaquina === 'vh' && (tipoVehiculo?.toUpperCase().trim() === 'BICICLETA' || tipoVehiculo?.toUpperCase().trim() === 'PATINETA');
    const prefix = tipoVehiculo?.toUpperCase().trim() === 'PATINETA' ? 'PAT' : 'BIC';
    const autoPlate = `${prefix}-${id_aprendiz}-${Date.now().toString().slice(-4)}`;
    
    const placaNormalizada = isLightVehicle
      ? (placaSerial?.toUpperCase().trim() && placaSerial?.toUpperCase().trim() !== 'BICI' && placaSerial?.toUpperCase().trim() !== 'PATINETA'
          ? placaSerial.toUpperCase().trim()
          : autoPlate)
      : placaSerial?.toUpperCase().trim();

    const modeloNormalizado = isLightVehicle
      ? (modelo?.toUpperCase().trim() || (prefix === 'PAT' ? 'PATINETA' : 'BICICLETA'))
      : modelo?.toUpperCase().trim();

    //  validaciones básicas
    if (!id_aprendiz) {
      return response.status(400).json({ message: "Aprendiz inválido" });
    }

    if (
      !tipoMaquina ||
      !modeloNormalizado ||
      !placaNormalizada ||
      !firma ||
      (tipoMaquina === 'vh' && !tipoVehiculo)
    ) {
      return response.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    await client.query('BEGIN');

    //  verificar ingreso activo del día (sesión sin salida)
    const ingreso = await client.query(
      `SELECT di.id_ingreso
       FROM detalles_ingreso di
       LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
       WHERE di.id_aprendiz = $1
       AND di.hora_ingreso >= CURRENT_DATE
       AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
       AND ds.hora_salida IS NULL
       ORDER BY di.hora_ingreso DESC
       LIMIT 1`,
      [id_aprendiz]
    );

    if (ingreso.rowCount === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ message: "No hay ingreso activo hoy" });
    }

    const id_ingreso = ingreso.rows[0].id_ingreso;

    //  verificar duplicados con detección de sesión activa
    const duplicateCheck = await checkDuplicate(client, placaNormalizada);
    if (duplicateCheck.isDuplicate) {
      await client.query('ROLLBACK');
      return response.status(409).json({
        aviso: 'maquinaYaRegistrada',
        message: "Esta máquina está siendo portada actualmente por otro aprendiz",
        portador: duplicateCheck.portador
      });
    }

    //  lógica central
    let machineResult: checkMachineResult;

    if (tipoMaquina === 'vh') {
      machineResult = await checkVehicle(
        client,
        placaNormalizada,
        id_aprendiz,
        forzarExcepcion,
        tipoVehiculo,
        modeloNormalizado
      );
    } else {
      machineResult = await checkComputer(
        client,
        placaNormalizada,
        id_aprendiz,
        forzarExcepcion,
        modeloNormalizado
      );
    }

    const tipoEquipo = tipoMaquina === 'vh' ? 'vehiculo' : 'computador';

    //  manejo de estados
    switch (machineResult.status) {
      case 'diferenteAprendiz':
        await client.query('ROLLBACK');
        return response.status(409).json({
          aviso: "diferenteAprendiz",
          tipoEquipo,
          excepcion: true,
          inconsistencia: true
        });

      case 'maquinaYaPrestadaHoy':
        await client.query('ROLLBACK');
        return response.status(409).json({
          aviso: "maquinaYaPrestadaHoy",
          excepcion: false,
          inconsistencia: true
        });

      case 'maquinaSinDueño':
        await client.query('ROLLBACK');
        return response.status(409).json({
          aviso: "maquinaSinDueño",
          tipoEquipo: "vehiculo",
          placaSerial: machineResult.data.placa ?? machineResult.data.serial,
          modelo: machineResult.data.modelo,
          tipo_vehiculo: machineResult.data.tipo,
          inconsistencia: true
        });

      case 'maquinaPrincipalExistente':
        await client.query('ROLLBACK');
        return response.status(409).json({
          aviso: "maquinaPrincipalExistente",
          tipoEquipo: "vehiculo",
          excepcion: true,
          inconsistencia: true
        });

      case 'ok':
        break;

      default:
        await client.query('ROLLBACK');
        console.error('Estado inesperado:', machineResult);
        return response.status(500).json({
          error: "Estado no manejado"
        });
    }

    const idMaquina = machineResult.idMaquina;

    //  insertar detalle máquina
    const resultDetallesMaquina = await client.query(
      `INSERT INTO detalles_maquinas(id_computador, id_vehiculo, firma_ingreso, id_ingreso)
       VALUES ($1, $2, $3, $4)
       RETURNING id_detallemaquina`,
      [
        tipoMaquina === 'pc' ? idMaquina : null,
        tipoMaquina === 'vh' ? idMaquina : null,
        firma,
        id_ingreso
      ]
    );

    const idDetallesMaquina = resultDetallesMaquina.rows[0].id_detallemaquina;

    // 🔗 vincular con ingreso
    await client.query(
      `UPDATE detalles_ingreso
       SET id_detallemaquina = $1
       WHERE id_ingreso = $2`,
      [idDetallesMaquina, id_ingreso]
    );

    await client.query('COMMIT');

    return response.status(201).json({
      message: "Máquina registrada correctamente",
      idDetallesMaquina
    });

  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('🔥 ERROR REAL:', error);

    return response.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    client.release();
  }
};


// Funcion para la doble maquina del aprendiz
/**
 * @swagger
 * /api/registroIngresos/ingresoDobleMaquina/{id_aprendiz}:
 *   post:
 *     summary: Registrar una segunda máquina para el aprendiz
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: id_aprendiz
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Segunda máquina registrada
 */
export const UpdateMachine = async (request: Request, response: Response) => {

  const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma } = request.body
  const { id_aprendiz } = request.params

  const detalle = await pool.query(
    `SELECT di.id_ingreso
     FROM detalles_ingreso di
     LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
     WHERE di.id_aprendiz = $1
     AND di.hora_ingreso >= CURRENT_DATE
     AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
     AND ds.hora_salida IS NULL
     ORDER BY di.hora_ingreso DESC
     LIMIT 1`,
    [id_aprendiz]
  )

  if (detalle.rowCount === 0) {
    return response.status(404).json({
      message: "No existe ingreso activo hoy"
    })
  }

  const id_ingreso = detalle.rows[0].id_ingreso

  if (tipoMaquina == 'pc') {

    const computador = await pool.query(
      "INSERT INTO computadores(serial,modelo) VALUES($1,$2) RETURNING id_computador",
      [placaSerial, modelo]
    )

    const id_computador = computador.rows[0].id_computador

    await pool.query(
      `INSERT INTO detalles_maquinas (id_computador, firma_ingreso, id_ingreso)
       VALUES ($1, $2, $3)`,
      [id_computador, firma, id_ingreso]
    )

  } else if (tipoMaquina == 'vh') {

    const vehiculo = await pool.query(
      "INSERT INTO vehiculos(tipo_vehiculo, placa, modelo) VALUES($1,$2,$3) RETURNING id_vehiculo",
      [tipoVehiculo, placaSerial, modelo]
    )

    const id_vehiculo = vehiculo.rows[0].id_vehiculo

    await pool.query(
      `INSERT INTO detalles_maquinas (id_vehiculo, firma_ingreso, id_ingreso)
       VALUES ($1, $2, $3)`,
      [id_vehiculo, firma, id_ingreso]
    )
  }

  return response.status(200).json({
    message: "Máquina actualizada correctamente"
  })
}


// Funcion para consultar los datos de las maquinas del aprendiz

/**
 * @swagger
 * /api/registroIngresos/detalleMaquinas/{id_aprendiz}:
 *   get:
 *     summary: Obtener detalle de las máquinas vinculadas al aprendiz
 *     tags: [RegistroIngresos]
 *     parameters:
 *       - in: path
 *         name: id_aprendiz
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de máquinas (PC/Vehículos) vinculadas
 */
export const SearchMachine = async (request: Request, response: Response) => {
  const { id_aprendiz } = request.params
  const id_detallemaquina = Array.isArray(id_aprendiz) ? id_aprendiz[0] : id_aprendiz

  if (!id_detallemaquina) {
    return response.status(400).json({
      message: "Debe enviar el id del detalle de máquina"
    })
  }

  const client = await pool.connect()

  try {
    const query = `
      SELECT
        dm.id_detallemaquina,
        dm.id_ingreso,
        di.id_aprendiz,
        a_act.documento AS aprendiz_documento,
        c.marca AS pc_marca,
        c.serial AS pc_serial,

        v.tipo_vehiculo,
        v.modelo AS vh_modelo,
        v.placa AS vh_placa,

        dm.firma_ingreso,
        dm.firma_salida,
        dm.estado_equipo,
        dm.hora_retiro_equipo,
        ds.hora_salida AS sesion_hora_salida,

        ac2.id_aprendiz AS owner_pc_id,
        aopc.nombre AS owner_pc_name,

        av2.id_aprendiz AS owner_vh_id,
        aov.nombre AS owner_vh_name,

        ac_np.id_computador AS non_principal_pc,
        av_np.id_vehiculo AS non_principal_vh

      FROM detalles_maquinas dm

      LEFT JOIN detalles_ingreso AS di
        ON di.id_ingreso = dm.id_ingreso OR di.id_detallemaquina = dm.id_detallemaquina

      LEFT JOIN detalles_salida AS ds
        ON ds.id_ingreso = COALESCE(dm.id_ingreso, di.id_ingreso)

      LEFT JOIN aprendiz a_act
        ON a_act.id_aprendiz = di.id_aprendiz

      LEFT JOIN computadores c
        ON dm.id_computador = c.id_computador

      LEFT JOIN vehiculos v
        ON dm.id_vehiculo = v.id_vehiculo

      LEFT JOIN aprendiz_computador ac2
        ON ac2.id_computador = dm.id_computador
        AND ac2.principal = true

      LEFT JOIN aprendiz aopc
        ON aopc.id_aprendiz = ac2.id_aprendiz

      LEFT JOIN aprendiz_vehiculo av2
        ON av2.id_vehiculo = dm.id_vehiculo
        AND av2.principal = true

      LEFT JOIN aprendiz aov
        ON aov.id_aprendiz = av2.id_aprendiz

      LEFT JOIN aprendiz_computador ac_np
        ON ac_np.id_aprendiz = di.id_aprendiz
        AND ac_np.id_computador = dm.id_computador
        AND ac_np.principal = false

      LEFT JOIN aprendiz_vehiculo av_np
        ON av_np.id_aprendiz = di.id_aprendiz
        AND av_np.id_vehiculo = dm.id_vehiculo
        AND av_np.principal = false

      WHERE dm.id_ingreso = (
        SELECT COALESCE(dm_sub.id_ingreso, di_sub.id_ingreso)
        FROM detalles_maquinas dm_sub
        LEFT JOIN detalles_ingreso di_sub ON di_sub.id_detallemaquina = dm_sub.id_detallemaquina
        WHERE dm_sub.id_detallemaquina = $1::integer
        LIMIT 1
      )
      OR dm.id_detallemaquina = $1::integer
      OR di.id_ingreso = (
        SELECT di_act.id_ingreso
        FROM detalles_ingreso di_act
        LEFT JOIN detalles_salida ds ON ds.id_ingreso = di_act.id_ingreso
        WHERE di_act.id_aprendiz = $1::integer
          AND di_act.hora_ingreso >= CURRENT_DATE
          AND ds.hora_salida IS NULL
        ORDER BY di_act.hora_ingreso DESC
        LIMIT 1
      )
      ORDER BY dm.id_detallemaquina ASC
    `

    const result = await pool.query(query, [id_detallemaquina])

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "No se encontraron máquinas para este registro"
      })
    }

    const first = result.rows[0]
    const ownerId = first.owner_pc_id ?? first.owner_vh_id ?? null

    const isBorrowed =
      ownerId != null && String(ownerId) !== String(first.id_aprendiz)

    const isNonPrincipal =
      !isBorrowed &&
      (first.non_principal_pc != null || first.non_principal_vh != null)

    const estado = isBorrowed
      ? 'PRESTADA'
      : isNonPrincipal
        ? 'NO_PRINCIPAL'
        : 'NORMAL'

    const sesion_cerrada = result.rows.some((r) => r.sesion_hora_salida !== null && r.sesion_hora_salida !== undefined)

    const items = result.rows.map((data) => {
      const itemOwnerId = data.owner_pc_id ?? data.owner_vh_id ?? null
      const itemOwnerName = data.owner_pc_name ?? data.owner_vh_name ?? null

      return {
        id_detallemaquina: data.id_detallemaquina,
        pc: data.pc_marca ? {
          marca: data.pc_marca,
          serial: data.pc_serial,
        } : null,
        vh: data.vh_modelo ? {
          tipo_vehiculo: data.tipo_vehiculo,
          marca: data.vh_modelo,
          placa: data.vh_placa,
        } : null,
        firma: data.firma_ingreso,
        firma_salida: data.firma_salida,
        estado_equipo: data.estado_equipo,
        hora_retiro_equipo: data.hora_retiro_equipo,
        aprendices: {
          actual: {
            id: data.id_aprendiz ?? null,
            documento: data.aprendiz_documento ?? null,
          },
          owner: {
            id: itemOwnerId,
            name: itemOwnerName,
          },
        },
      }
    })

    return response.status(200).json({
      estado,
      result: {
        ...items[0],
        sesion_cerrada,
        items
      }
    })

  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Error al buscar las máquinas",
      error
    })
  } finally {
    client.release()
  }
}
