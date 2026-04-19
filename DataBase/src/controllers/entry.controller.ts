// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { checkDuplicate } from './HandlersMachine/checkDuplicate';
import { checkVehicle } from './HandlersMachine/checkVehicle';
import { checkComputer } from './HandlersMachine/checkComputer';
import { checkMachineResult } from '../types/InconsistentMachine.types';
import { getTodayBorrowed } from './HandlersMachine/checksBorroweds';
import { getTodayNonPrincipal } from './HandlersMachine/checkNonPrincipal';
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
    const { documento } = request.params;

    // 1️⃣ Verificar si el aprendiz existe
    const aprendiz = await pool.query(
      `SELECT id_aprendiz FROM aprendiz WHERE documento = $1`,
      [documento]
    );

    if (aprendiz.rowCount === 0) {
      return response.status(404).json({
        message: "El documento no existe en la base de datos"
      });
    }

    // 2️⃣ Verificar si ya tiene ingreso hoy
    const ingresoVerificado = await pool.query(`
      SELECT di.id_ingreso
      FROM detalles_ingreso di
      WHERE di.id_aprendiz = $1
      AND di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `, [aprendiz.rows[0].id_aprendiz]);

    if (ingresoVerificado.rowCount! > 0) {
      return response.status(200).json({
        message: "El aprendiz ya tiene un registro hoy",
        yaIngresado: true
      });
    }

    // 3️⃣ Todo bien, puede ingresar
    return response.status(200).json({
      message: "El aprendiz puede ingresar",
      yaIngresado: false
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
  const client = await pool.connect();

  try {
    const id_aprendiz = request.params.id;
    console.log(id_aprendiz)
    const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma, forzarExcepcion } = request.body;
    console.log(forzarExcepcion)
    const placaNormalizada = placaSerial?.toUpperCase().trim();
    const modeloNormalizado = modelo?.toUpperCase().trim();
    console.log(tipoMaquina, tipoVehiculo, modelo, placaSerial,forzarExcepcion)
    if (!id_aprendiz) {
      return response.status(400).json({ message: "Aprendiz inválido" });
    }

    if (!tipoMaquina || !modeloNormalizado || !placaNormalizada || !firma || (tipoMaquina === 'vh' && !tipoVehiculo)) {
      return response.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    await client.query('BEGIN');

    const ingreso = await client.query(
      `SELECT id_ingreso
       FROM detalles_ingreso
       WHERE id_aprendiz = $1
       AND hora_ingreso >= CURRENT_DATE
       AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
       LIMIT 1`,
      [id_aprendiz]
    );

    if (ingreso.rowCount === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ message: "No hay ingreso hoy" });
    }

    const id_ingreso = ingreso.rows[0].id_ingreso;


    const checkExist = await checkDuplicate(client,placaNormalizada)
    if (checkExist) {
      await client.query('ROLLBACK');
      return response.status(409).json({
        message: "Esta máquina ya está registrada hoy"
      });
    }

    let idMaquina: number | null = null;

    let vehicleMachine : checkMachineResult
    console.log('ANTES DEL CHECK')
    if (tipoMaquina === 'vh') {vehicleMachine = await checkVehicle(client,placaNormalizada,id_aprendiz,forzarExcepcion,tipoVehiculo,modeloNormalizado)}
    else {vehicleMachine = await checkComputer(client,placaNormalizada,id_aprendiz,forzarExcepcion,modeloNormalizado)}
    console.log('DESPUÉS DEL CHECK', vehicleMachine)
    const tipoEquipo = tipoMaquina == 'vh' ? 'vehiculo' : 'computador'

    if(vehicleMachine.status === 'diferenteAprendiz'){
      await client.query('ROLLBACK')
        return response.status(409).json({
          aviso: "diferenteAprendiz",
          tipoEquipo:tipoEquipo,
          excepcion: true,
          inconsistencia : true,
        });
      }
      else if(vehicleMachine.status == 'maquinaYaPrestadaHoy'){
        await client.query('ROLLBACK')
        return response.status(409).json({
          aviso: "maquinaYaPrestadaHoy",
          excepcion: false,
          inconsistencia : true,
        });
      }
      else if(vehicleMachine.status == 'maquinaSinDueño'){
        await client.query('ROLLBACK')
        return response.status(409).json({
          aviso: "maquinaSinDueño",
          tipoEquipo: "vehiculo",
          placaSerial: vehicleMachine.data.placa == null ? vehicleMachine.data.serial : vehicleMachine.data.placa,
          modelo: vehicleMachine.data.modelo,
          tipo_vehiculo: vehicleMachine.data.tipo,
          inconsistencia : true,
        });
      }
      else if(vehicleMachine.status == 'maquinaPrincipalExistente'){
        await client.query('ROLLBACK')
        return response.status(409).json({
        aviso: "maquinaPrincipalExistente",
        tipoEquipo: "vehiculo",
        excepcion: true,
        inconsistencia : true,
      });
      }
      if (vehicleMachine.status !== 'ok') {
        await client.query('ROLLBACK')
        console.log('Estado inesperado:', vehicleMachine)
        return response.status(500).json({
          error: "Estado no manejado",
        });
      }
      idMaquina = vehicleMachine.idMaquina


    const resultDetallesMaquina = await client.query(
      `INSERT INTO detalles_maquinas(id_computador, id_vehiculo, firma_ingreso)
       VALUES ($1, $2, $3)
       RETURNING id_detallemaquina`,
      [
        tipoMaquina === 'pc' ? idMaquina : null,
        tipoMaquina === 'vh' ? idMaquina : null,
        firma
      ]
    );

    const idDetallesMaquina = resultDetallesMaquina.rows[0].id_detallemaquina;

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
export const UpdateMachine = async (request: Request, response: Response) => {

  const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma } = request.body
  const { id_aprendiz } = request.params

  const detalle = await pool.query(
    `SELECT id_detallemaquina
     FROM detalles_ingreso
     WHERE id_aprendiz = $1
     AND hora_ingreso >= CURRENT_DATE
     AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'`,
    [id_aprendiz]
  )

  if (detalle.rowCount === 0) {
    return response.status(404).json({
      message: "No existe ingreso hoy"
    })
  }

  const id_detallemaquina = detalle.rows[0].id_detallemaquina

  if (tipoMaquina == 'pc') {

    const computador = await pool.query(
      "INSERT INTO computadores(serial,modelo) VALUES($1,$2) RETURNING id_computador",
      [placaSerial, modelo]
    )

    const id_computador = computador.rows[0].id_computador

    await pool.query(
      `UPDATE detalles_maquinas
       SET id_computador = $1, firma_ingreso = $2
       WHERE id_detallemaquina = $3`,
      [id_computador, firma, id_detallemaquina]
    )

  } else if (tipoMaquina == 'vh') {

    const vehiculo = await pool.query(
      "INSERT INTO vehiculos(tipo_vehiculo, placa, modelo) VALUES($1,$2,$3) RETURNING id_vehiculo",
      [tipoVehiculo, placaSerial, modelo]
    )

    const id_vehiculo = vehiculo.rows[0].id_vehiculo

    await pool.query(
      `UPDATE detalles_maquinas
       SET id_vehiculo = $1, firma_ingreso = $2
       WHERE id_detallemaquina = $3`,
      [id_vehiculo, firma, id_detallemaquina]
    )
  }

  return response.status(200).json({
    message: "Máquina actualizada correctamente"
  })
}


// Funcion para consultar los datos de las maquinas del aprendiz

export const SearchMachine = async (request: Request, response: Response) => {
  const { id_aprendiz } = request.params

  const id = Array.isArray(id_aprendiz) ? id_aprendiz[0] : id_aprendiz

  if (!id) {
    return response.status(400).json({
      message: "Debe enviar el id del aprendiz"
    })
  }

  const client = await pool.connect()

  try {
    // 1. PRESTADA
    const prestada = await getTodayBorrowed(client, id)

    if (prestada.length > 0) {
      return response.status(200).json({
        estado: 'PRESTADA',
        result: prestada[0]
      })
    }

    // 2. NO PRINCIPAL
    const noPrincipal = await getTodayNonPrincipal(client, id)

    if (noPrincipal.length > 0) {
      return response.status(200).json({
        estado: 'NO_PRINCIPAL',
        result: noPrincipal[0]
      })
    }

    // 3. NORMAL (SIEMPRE MISMO SHAPE)
    const query = `
      SELECT
        c.marca AS pc_marca,
        c.serial AS pc_serial,

        v.tipo_vehiculo,
        v.modelo AS vh_marca,
        v.placa AS vh_placa,

        dm.firma_ingreso,

        d.id_aprendiz AS "aprendizActual",
        d.id_aprendiz AS "ownerId",
        'Propietario' AS "ownerName"

      FROM detalles_ingreso d
      JOIN detalles_maquinas dm
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

    const result = await client.query(query, [id])

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "No se encontraron máquinas registradas"
      })
    }

    const data = result.rows[0]

    const dto = {
      pc: data.pc_marca
        ? { marca: data.pc_marca, serial: data.pc_serial }
        : null,

      vh: data.vh_marca
        ? {
            tipo_vehiculo: data.tipo_vehiculo,
            marca: data.vh_marca,
            placa: data.vh_placa
          }
        : null,

      firma: data.firma_ingreso ?? null,

      aprendices: {
        actual: { id: data.aprendizActual },
        owner: { id: data.ownerId, name: data.ownerName }
      }
    }

    return response.status(200).json({
      estado: 'NORMAL',
      result: dto
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
