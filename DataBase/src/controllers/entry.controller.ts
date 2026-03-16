// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// Funcion para el ingreso de aprendiz
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

    // Verificar si ya tiene ingreso
    const ingresoRecord = await pool.query(`
      SELECT id_ingreso
      FROM detalles_ingreso
      WHERE id_aprendiz = $1
      AND hora_ingreso >= CURRENT_DATE
      AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `,[id_aprendiz])

    // si se encuentra un registro, no permitir un nuevo registro
    if (ingresoRecord.rowCount! > 0) {
      return res.status(409).json({ message: "El aprendiz ya tiene un registro" });
    }

    // Insertar nuevo ingreso
    const result = await pool.query(
      'INSERT INTO detalles_ingreso (id_aprendiz) VALUES ($1) RETURNING *',
      [id_aprendiz]
    );

    // mandar resultados
    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Hay un error" });
  }
};


// Funcion para verificar el ingreso de un aprendiz
export const DetectEntry = async (request: Request, response: Response) => {
  try {

    const { documento } = request.params

    const ingresoVerificado = await pool.query(`
      SELECT di.id_ingreso
      FROM detalles_ingreso di
      JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
      WHERE a.documento = $1
      AND di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `,[documento])

    if (ingresoVerificado.rowCount! > 0) {
      return response.status(200).json({
        message: "El aprendiz ya tiene un registro hoy",
        yaIngresado: true
      })
    }

    return response.status(200).json({
      message: "El aprendiz no tiene registro hoy",
      yaIngresado: false
    })

  } catch (error) {

    console.error(error)

    response.status(500).json({
      message: "Hay un error",
      error: error
    })
  }
}



// Funcion para el historial de ingresos
export const EntryRecord = async (request: Request, response: Response) => {
  try {

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        di.id_detallemaquina

      FROM detalles_ingreso AS di

      JOIN aprendiz AS a
      ON a.id_aprendiz = di.id_aprendiz

      JOIN formaciones AS f
      ON f.id_formacion = a.id_formacion

      LEFT JOIN detalles_maquinas AS dm
      ON dm.id_detallemaquina = di.id_detallemaquina

      WHERE di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'

      ORDER BY di.id_ingreso DESC
    `);

    if (result.rowCount === 0) {
      return response.status(404).json({
        message: "No se encontraron registros hoy"
      });
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
export const EntryManual = async (request: Request, response : Response) =>{
  const {documento} = request.params

    // Obtener el aprendiz por documento
    const aprendizRecord = await pool.query(
      'SELECT a.nombre,a.apellido,f.nombre AS formacion FROM aprendiz AS a  JOIN formaciones AS f ON f.id_formacion = a.id_formacion WHERE documento = $1',[documento]);

    // verificar si el aprendiz si esta en la base de datos
    if (aprendizRecord.rowCount == 0) {
      return response.status(404).json({ message: "Aprendiz no encontrado" });
    }

    const result = aprendizRecord.rows[0]

    response.status(200).json({result})
}


// Funcion para la busqueda de un aprendiz
export const SearchAprendiz = async (request: Request, response: Response) => {
  try {

    const text = (request.query.q as string)?.trim() //traer el texto de busqueda

    if (!text) {
      return response.status(400).json({
        message: "Debe escribir algo" // si no escribe algo
      })
    }

    const pattern = `%${text}%` //patron para la busqueda

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        di.id_detallemaquina
      FROM detalles_ingreso AS di
      JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
      JOIN formaciones AS f ON f.id_formacion = a.id_formacion
      WHERE
        (
          a.documento ILIKE $1
          OR a.nombre ILIKE $1
          OR a.apellido ILIKE $1
        )
      AND di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `, [pattern]) // consulta SQL

    console.log("Busqueda:", text)

    response.status(200).json(result.rows) // mandar el array

  } catch (error) {

    console.error(error)

    response.status(500).json({
      message: "Error en la busqueda"
    })

  }
}


// Funcion para ingresar la maquina del aprendiz
export const AddMachine = async (request: Request, response: Response) => {
  const client = await pool.connect(); // Conexión para transacción

  try {
    const id_aprendiz = request.params.id;
    const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma } = request.body;

    if (!id_aprendiz) {
      return response.status(400).json({ message: "Aprendiz inválido" });
    }

    // Validar campos obligatorios
    if (!tipoMaquina || !modelo || !placaSerial || !firma || (tipoMaquina === 'vh' && !tipoVehiculo)) {
      return response.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    await client.query('BEGIN'); // Iniciar transacción

    let idMaquina: number | null = null;

    if (tipoMaquina === 'vh') {
      // Verificar si el vehículo ya existe
      const vehiculo = await client.query(
        "SELECT id_vehiculo FROM vehiculos WHERE placa = $1",
        [placaSerial]
      );

      if (vehiculo.rowCount && vehiculo.rowCount > 0) {
        idMaquina = vehiculo.rows[0].id_vehiculo; // ya existe
      } else {
        // Insertar nuevo vehículo
        const result = await client.query(
          "INSERT INTO vehiculos(tipo_vehiculo, placa, modelo, firma_ingreso) VALUES ($1,$2,$3,$4) RETURNING id_vehiculo",
          [tipoVehiculo, placaSerial, modelo, firma]
        );
        idMaquina = result.rows[0].id_vehiculo;
      }
    } else if (tipoMaquina === 'pc') {
      // Verificar si la PC ya existe
      const pc = await client.query(
        "SELECT id_computador FROM computadores WHERE serial = $1",
        [placaSerial]
      );

      if (pc.rowCount && pc.rowCount > 0) {
        idMaquina = pc.rows[0].id_computador; // ya existe
      } else {
        // Insertar nueva PC
        const result = await client.query(
          "INSERT INTO computadores(serial, modelo, firma_ingreso) VALUES ($1,$2,$3) RETURNING id_computador",
          [placaSerial, modelo, firma]
        );
        idMaquina = result.rows[0].id_computador;
      }
    }

      // Antes de insertar en detalles_maquinas
    const checkExist = await client.query(
      "SELECT dm.id_detallemaquina FROM detalles_maquinas dm " +
      "JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina " +
      "WHERE di.id_aprendiz = $1 AND di.hora_ingreso >= CURRENT_DATE AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day' AND (dm.id_computador = $2 OR dm.id_vehiculo = $3)",
      [id_aprendiz, tipoMaquina === 'pc' ? idMaquina : null, tipoMaquina === 'vh' ? idMaquina : null]
    );

    if (checkExist.rowCount && checkExist.rowCount > 0) {
      await client.query('ROLLBACK');
      return response.status(409).json({ message: "Esta máquina ya está registrada para este aprendiz hoy" });
    }

    // Insertar en detalles_maquinas (colocando los IDs en la columna correcta)
    const resultDetallesMaquina = await client.query(
      "INSERT INTO detalles_maquinas(id_computador, id_vehiculo) VALUES ($1, $2) RETURNING id_detallemaquina",
      [
        tipoMaquina === 'pc' ? idMaquina : null,    // id_computador
        tipoMaquina === 'vh' ? idMaquina : null     // id_vehiculo
      ]
    );

    const idDetallesMaquina = resultDetallesMaquina.rows[0].id_detallemaquina;

    // Actualizar detalles_ingreso con id_detalles_maquinas
    await client.query(
      "UPDATE detalles_ingreso SET id_detallemaquina = $1 WHERE id_aprendiz = $2",
      [idDetallesMaquina, id_aprendiz]
    );

    await client.query('COMMIT'); // Confirmar transacción

    return response.status(201).json({
      message: "Máquina registrada y vinculada correctamente",
      idDetallesMaquina
    });

  } catch (error: unknown) {
    await client.query('ROLLBACK'); // Deshacer si falla algo

    if (error instanceof Error) {
      console.error('Error completo:', error.message);
      console.error(error.stack);
      return response.status(500).json({ message: "Error en el ingreso de máquina", error: error.message });
    } else {
      console.error('Error inesperado:', error);
      return response.status(500).json({ message: "Error en el ingreso de máquina", error: String(error) });
    }
  } finally {
    client.release(); // Liberar conexión
  }
};


// Funcion para la doble maquina del aprendiz
export const UpdateMachine = async (request: Request, response: Response) => {

  const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma } = request.body
  const { id_aprendiz } = request.params

  const detalle = await pool.query(
    "SELECT id_detallemaquina FROM detalles_ingreso WHERE id_aprendiz = $1 AND hora_ingreso >= CURRENT_DATE AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'",
    [id_aprendiz]
  )

  if (detalle.rowCount === 0) {
    return response.status(404).json({
      message: "No existe un detalle de ingreso para este aprendiz"
    })
  }

  const id_detallemaquina = detalle.rows[0].id_detallemaquina

  if (tipoMaquina == 'pc') {

    const computador = await pool.query(
      "INSERT INTO computadores(serial,modelo,firma_ingreso) VALUES($1,$2,$3) RETURNING id_computador",
      [placaSerial, modelo, firma]
    )

    const id_computador = computador.rows[0].id_computador

    if (computador.rowCount && computador.rowCount > 0) {

      const result = await pool.query(
        "UPDATE detalles_maquinas SET id_computador = $1 WHERE id_detallemaquina = $2",
        [id_computador, id_detallemaquina]
      )

      return response.status(201).json(result.rows)
    }

  } else if (tipoMaquina == 'vh') {

    const vehiculo = await pool.query(
      "INSERT INTO vehiculos(tipo_vehiculo, placa, modelo, firma_ingreso) VALUES($1,$2,$3,$4) RETURNING id_vehiculo",
      [tipoVehiculo, placaSerial, modelo, firma]
    )

    const id_vehiculo = vehiculo.rows[0].id_vehiculo

    if (vehiculo.rowCount && vehiculo.rowCount > 0) {

      const result = await pool.query(
        "UPDATE detalles_maquinas SET id_vehiculo = $1 WHERE id_detallemaquina = $2",
        [id_vehiculo, id_detallemaquina]
      )

      return response.status(201).json(result.rows)
    }

  }

}


// Funcion para consultar los datos de las maquinas del aprendiz

export const SearchMachine = async (request: Request, response: Response) => {

  const { id_aprendiz } = request.params

  if (!id_aprendiz) {
    return response.status(400).json({
      message: "Debe enviar el id del aprendiz"
    })
  }

  try {

    const query = `
      SELECT
        c.modelo AS pc_modelo,
        c.serial AS pc_serial,
        c.firma_ingreso AS pc_firma,

        v.tipo_vehiculo,
        v.modelo AS vh_modelo,
        v.placa AS vh_placa,
        v.firma_ingreso AS vh_firma

      FROM detalles_ingreso d

      JOIN detalles_maquinas AS dm
      ON dm.id_detallemaquina = d.id_detallemaquina

      LEFT JOIN computadores c
      ON dm.id_computador = c.id_computador

      LEFT JOIN vehiculos v
      ON dm.id_vehiculo = v.id_vehiculo

      WHERE d.id_aprendiz = $1
      AND d.hora_ingreso >= CURRENT_DATE
      AND d.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
      LIMIT 1
    `

    const result = await pool.query(query, [id_aprendiz])

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "No se encontraron máquinas registradas"
      })
    }

    const data = result.rows[0]

    const maquinas = {
      pc: data.pc_modelo ? {
        modelo: data.pc_modelo,
        placa_serial: data.pc_serial,
        firma: data.pc_firma
      } : null,

      vh: data.vh_modelo ? {
        tipo_vehiculo: data.tipo_vehiculo,
        modelo: data.vh_modelo,
        placa_serial: data.vh_placa,
        firma: data.vh_firma
      } : null
    }

    return response.status(200).json({
      result: maquinas
    })

  } catch (error) {

    console.error(error)

    return response.status(500).json({
      message: "Error al buscar las máquinas",
      error: error
    })

  }

}
