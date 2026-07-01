// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap';

// Funcion para el ingreso de aprendiz
/**
 * @swagger
 * /api/historico/historial:
 *   get:
 *     summary: Obtener historial general de ingresos y salidas
 *     tags: [Historial]
 *     responses:
 *       200:
 *         description: Lista histórica de registros
 */
export const HistoryRecord = async (request: Request, response: Response) => {
  try {

    const result = await pool.query(`
    SELECT
      a.id_aprendiz,
      a.nombre,
      a.apellido,
      a.documento,
      f.nombre AS formacion,
      TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
      TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
      di.id_detallemaquina,
      di.tipo_sesion
    FROM detalles_ingreso AS di
    JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    LEFT JOIN aprendiz_formacion af ON af.id_aprendiz = a.id_aprendiz AND af.estado = 'activo'
    LEFT JOIN formaciones f ON f.id_formacion = af.id_formacion
    WHERE di.hora_ingreso >= CURRENT_DATE
    AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    ORDER BY di.hora_ingreso DESC
    `);

    if (result.rowCount === 0) {
      console.log(result.rows)
      return response.status(404).json({
        message: "No se encontraron registros hoy"
      });
    }
    console.log(result.rows)
    return response.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return response.status(500).json({
      message: "Hay un error en el servidor",
      error
    });
  }
};

// Historial con filtro
/**
 * @swagger
 * /api/historico/historialFechas:
 *   get:
 *     summary: Obtener historial filtrado por fechas predefinidas (Hoy, Ayer, Mes, etc.)
 *     tags: [Historial]
 *     parameters:
 *       - in: query
 *         name: dates
 *         schema:
 *           type: string
 *         description: Filtros de fecha separados por coma
 *     responses:
 *       200:
 *         description: Historial filtrado
 */
export const DateRecord = async (request: Request, response: Response) => {
  try {
    const { date, program,search } = request.query as {
      date?: keyof typeof filtersMap.date
      program?: keyof typeof filtersMap.program
      search? : string
    }

    const conditions: string[] = []

    if (date && filtersMap.date[date]) {
      conditions.push(filtersMap.date[date])
    }

    if (program && filtersMap.program[program]) {
      conditions.push(filtersMap.program[program])
    }

    const values: string[] = []

    if (search) {
      values.push(`%${search}%`)
      conditions.push(`
        (
          a.nombre ILIKE $${values.length} OR
          a.apellido ILIKE $${values.length} OR
          a.documento ILIKE $${values.length}
        )
      `)
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida,
        di.id_detallemaquina,
        di.tipo_sesion,
        di.id_ingreso
      FROM detalles_ingreso AS di
      JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      LEFT JOIN aprendiz_formacion af ON af.id_aprendiz = a.id_aprendiz AND af.estado = 'activo'
      LEFT JOIN formaciones f ON f.id_formacion = af.id_formacion
      ${whereClause}
      ORDER BY di.hora_ingreso DESC
    `,values)

    response.json(result.rows)

  } catch (error) {
    console.error(error)
    response.status(500).json({ message: 'Error en el servidor' })
  }
}

/**
 * @swagger
 * /api/historico/historialGeneral:
 *   post:
 *     summary: Exportar historial general filtrado
 *     tags: [Historial]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *               dates:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos para exportación
 */
export const DataRegister = async (request: Request, response: Response) => {
  try {
    const { date, program, search, reportType, entryStatus } = request.body as {
      date?: keyof typeof filtersMap.date
      program?: keyof typeof filtersMap.program
      search?: string
      reportType?: 'entries' | 'exits' | 'history' | 'assets',
      entryStatus? : 'WITH_MACHINE' | 'WITHOUT_MACHINE'
    }
    console.log("Tipo de vista", reportType)
    const conditions: string[] = []
    const values: string[] = []

    // 📅 filtros
    if (date && filtersMap.date[date]) {
      conditions.push(filtersMap.date[date])
    }

    if (program && filtersMap.program[program]) {
      conditions.push(filtersMap.program[program])
    }

    // 🔍 búsqueda
    if (search) {
      values.push(`%${search}%`)
      const param = `$${values.length}`

      conditions.push(`
        (
          a.nombre ILIKE ${param} OR
          a.apellido ILIKE ${param} OR
          a.documento ILIKE ${param}
        )
      `)
    }


    if (entryStatus === 'WITH_MACHINE') {
      conditions.push(`di.id_detallemaquina IS NOT NULL`)
    }

    if (entryStatus === 'WITHOUT_MACHINE') {
      conditions.push(`di.id_detallemaquina IS NULL`)
    }



    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    // 🧠 SELECT dinámico
    let selectExtra = ''
    let columns: { header: string; dataKey: string }[] = []
    let title = ''

    if (reportType === 'entries') {
      title = 'Reporte de Ingresos'

      selectExtra = `
        TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
        dm.id_detallemaquina,
        dm.firma_ingreso
      `

      columns = [
        { header: 'Documento', dataKey: 'documento' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'Hora ingreso', dataKey: 'hora_ingreso' },
        { header: 'Tipo Sesión', dataKey: 'tipo_sesion' },
        { header: 'Firma', dataKey: 'firma_ingreso' },
      ]
    }
    let joinSalida = 'LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso'
    if (reportType === 'exits') {
      joinSalida = 'JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso'
      title = 'Reporte de Salidas'
      selectExtra = `
        TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida,
        dm.id_detallemaquina,
        dm.firma_ingreso
      `

      columns = [
        { header: 'Documento', dataKey: 'documento' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'Hora salida', dataKey: 'hora_salida' },
        { header: 'Tipo Sesión', dataKey: 'tipo_sesion' },
        { header: 'Firma', dataKey: 'firma_ingreso' },
      ]
    }

    // default → history
    if (!reportType || reportType === 'history') {
      title = 'Reporte Histórico'

      selectExtra = `
        TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida,
        dm.id_detallemaquina,
        dm.firma_ingreso
      `

      columns = [
        { header: 'Documento', dataKey: 'documento' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'Hora ingreso', dataKey: 'hora_ingreso' },
        { header: 'Hora salida', dataKey: 'hora_salida' },
        { header: 'Tipo Sesión', dataKey: 'tipo_sesion' },
        { header: 'Firma', dataKey: 'firma_ingreso' },
      ]
    }
    console.log('ENTRY STATUS:', entryStatus)
    console.log('WHERE:', whereClause)
    const query = `
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        di.tipo_sesion,
        ${selectExtra}
      FROM detalles_ingreso di
      ${joinSalida}
      LEFT JOIN detalles_maquinas dm ON dm.id_detallemaquina = di.id_detallemaquina
      JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
      ${whereClause}
      ORDER BY di.hora_ingreso DESC
    `



    const result = await pool.query(query, values)
    const rows = result.rows.map(row => ({
      ...row,
      firma_ingreso: row.id_detallemaquina
        ? row.firma_ingreso
        : 'Sin maquina',
      hora_salida : row.hora_salida
        ? row.hora_salida
        : 'Sin registro',
      tipo_sesion: row.tipo_sesion === 'monitoria' ? 'Monitoría' : 'Formación'
    }))
    return response.json({
      title,
      columns,
      rows,
    })

  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: 'Error en el servidor',
    })
  }
}

// Query universal para  exportaciones

/**
 * @swagger
 * /api/historico/historialMaquinas:
 *   post:
 *     summary: Exportar historial de máquinas filtrado
 *     tags: [Historial]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *               dates:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos de máquinas para exportación
 */
export const DataMachine = async (request: Request, response: Response) => {
  try {
    const { date, program, search, tipoMaquina } = request.body as {
      date?: keyof typeof filtersMap.date
      program?: keyof typeof filtersMap.program
      search?: string
      tipoMaquina?: 'pc' | 'vh',
    }
    console.log(search)
    if (!tipoMaquina) {
      return response.status(400).json({ message: 'tipoMaquina es requerido' })
    }

    const conditions: string[] = []
    const values: string[] = []

    // filtros estáticos
    if (date && filtersMap.date[date]) {
      conditions.push(filtersMap.date[date])
    }

    if (program && filtersMap.program[program]) {
      conditions.push(filtersMap.program[program])
    }

    // búsqueda
    if (search) {
      values.push(`%${search}%`)
      const param = `$${values.length}`


  if (tipoMaquina === 'pc') {
    conditions.push(`
      (
        a.documento ILIKE ${param}
        OR c.serial ILIKE ${param}
      )
    `)
  }

  if (tipoMaquina === 'vh') {
    conditions.push(`
      (
        a.documento ILIKE ${param}
        OR v.placa ILIKE ${param}
      )
    `)
  }
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    let selectExtra = ''
    let joinExtra = ''

    if (tipoMaquina === 'pc') {
      selectExtra = `
        dm.id_computador,
        c.marca AS marca,
        c.serial,
      `
      joinExtra = `
        JOIN computadores c
          ON c.id_computador = dm.id_computador
      `
    }

    if (tipoMaquina === 'vh') {
      selectExtra = `
        dm.id_vehiculo,
        v.modelo AS marca,
        v.placa,
        v.tipo_vehiculo,
      `
      joinExtra = `
        JOIN vehiculos v
          ON v.id_vehiculo = dm.id_vehiculo
      `
    }

    const query = `
      SELECT
        ${selectExtra}
        dm.id_detallemaquina,
        dm.firma_salida,
        dm.estado_equipo,
        dm.hora_retiro_equipo,
        a.documento,
        a.id_aprendiz,
        dm.firma_ingreso,
        TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida
      FROM detalles_maquinas dm
      JOIN detalles_ingreso di
        ON di.id_detallemaquina = dm.id_detallemaquina
      LEFT JOIN detalles_salida ds
        ON ds.id_ingreso = di.id_ingreso
      JOIN aprendiz a
        ON a.id_aprendiz = di.id_aprendiz
      ${joinExtra}
      ${whereClause}
      ORDER BY di.hora_ingreso DESC
    `

    const result = await pool.query(query, values)
    const rows = result.rows.map(row => ({
      ...row,
      hora_salida : row.hora_salida
        ? row.hora_salida
        : 'Sin registro',
      firma_salida: row.firma_salida
        ? row.firma_salida
        : 'Sin firma de salida'
    }))
    const responseData = {
      title: tipoMaquina === 'pc' ? 'Reporte de Computadores' : 'Reporte de Vehículos',

      columns: tipoMaquina === 'pc'
        ? [
            { header: 'Documento', dataKey: 'documento' },
            { header: 'Marca', dataKey: 'marca' },
            { header: 'Serial', dataKey: 'serial' },
            { header: 'Hora ingreso', dataKey: 'hora_ingreso' },
            { header: 'Hora salida', dataKey: 'hora_salida' },
            { header: 'Firma Ingreso', dataKey: 'firma_ingreso' },
            { header: 'Firma Salida', dataKey: 'firma_salida' },
            { header: 'Estado', dataKey: 'estado_equipo' },
          ]
        : [
            { header: 'Documento', dataKey: 'documento' },
            { header: 'Marca', dataKey: 'marca' },
            { header: 'Placa', dataKey: 'placa' },
            { header: 'Tipo vehículo', dataKey: 'tipo_vehiculo' },
            { header: 'Hora ingreso', dataKey: 'hora_ingreso' },
            { header: 'Hora salida', dataKey: 'hora_salida' },
            { header: 'Firma Ingreso', dataKey: 'firma_ingreso' },
            { header: 'Firma Salida', dataKey: 'firma_salida' },
            { header: 'Estado', dataKey: 'estado_equipo' },
          ],

      rows
    }

    return response.json(responseData)
  } catch (error) {
    console.error(error)
    return response.status(500).json({ message: 'Error en el servidor' })
  }
}


// Funcion para consultar los datos de las maquinas del aprendiz

/**
 * @swagger
 * /api/historico/historialMaquinas/{id_detallemaquina}:
 *   get:
 *     summary: Consultar detalle de una máquina específica por su ID de detalle
 *     tags: [Historial]
 *     parameters:
 *       - in: path
 *         name: id_detallemaquina
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle de la máquina
 */
export const SearchMachine = async (request: Request, response: Response) => {

  const { id_detallemaquina } = request.params
  console.log(id_detallemaquina)
  if (!id_detallemaquina) {
    return response.status(400).json({
      message: "Debe enviar el id del detalle de máquina"
    })
  }

  try {
    const query = `
      SELECT
        di.id_aprendiz,
        c.marca AS pc_marca,
        c.serial AS pc_serial,

        v.tipo_vehiculo,
        v.modelo AS vh_modelo,
        v.placa AS vh_placa,

        dm.firma_ingreso,
        dm.firma_salida,
        dm.estado_equipo,
        dm.hora_retiro_equipo,

        ac2.id_aprendiz AS owner_pc_id,
        aopc.nombre AS owner_pc_name,

        av2.id_aprendiz AS owner_vh_id,
        aov.nombre AS owner_vh_name,

        ac_np.id_computador AS non_principal_pc,
        av_np.id_vehiculo AS non_principal_vh

      FROM detalles_maquinas dm

      JOIN detalles_ingreso AS di ON di.id_detallemaquina = dm.id_detallemaquina

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

      WHERE dm.id_detallemaquina = $1
    `

    const result = await pool.query(query, [id_detallemaquina])

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "No se encontró ese detalle de máquina"
      })
    }

    const data = result.rows[0]

    const ownerId = data.owner_pc_id ?? data.owner_vh_id ?? null
    const ownerName = data.owner_pc_name ?? data.owner_vh_name ?? null

    const isBorrowed =
      ownerId != null && String(ownerId) !== String(data.id_aprendiz)

    const isNonPrincipal =
      !isBorrowed &&
      (data.non_principal_pc != null || data.non_principal_vh != null)

    const estado = isBorrowed
      ? 'PRESTADA'
      : isNonPrincipal
        ? 'NO_PRINCIPAL'
        : 'NORMAL'

    const maquinas = {
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
        },
        owner: {
          id: ownerId,
          name: ownerName,
        },
      },
    }

    return response.status(200).json({
      estado,
      result: maquinas
    })

  } catch (error) {

    console.error(error)

    return response.status(500).json({
      message: "Error al buscar las máquinas",
      error
    })

  }
}
