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
    const { tipoMaquina, tipoVehiculo, modelo, placaSerial, firma, forzarExcepcion } = request.body;
    console.log(forzarExcepcion)
    const placaNormalizada = placaSerial?.toUpperCase().trim();
    const modeloNormalizado = modelo?.toUpperCase().trim();

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

    const checkExist = await client.query(
      `SELECT 1
       FROM detalles_maquinas dm
       JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
       LEFT JOIN computadores c ON dm.id_computador = c.id_computador
       LEFT JOIN vehiculos v ON dm.id_vehiculo = v.id_vehiculo
       WHERE
         ((c.serial = $1) OR (v.placa = $1))
       AND di.hora_ingreso >= CURRENT_DATE
       AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
       LIMIT 1`,
      [placaNormalizada]
    );

    if (checkExist.rowCount && checkExist.rowCount > 0) {
      await client.query('ROLLBACK');
      return response.status(409).json({
        message: "Esta máquina ya está registrada hoy"
      });
    }

    let idMaquina: number | null = null;

    // ================= VEHÍCULOS =================
    if (tipoMaquina === 'vh') {
      const vehiculo = await client.query(
        "SELECT * FROM vehiculos WHERE placa = $1",
        [placaNormalizada]
      );

      if (vehiculo.rowCount && vehiculo.rowCount > 0) {

        const principalMachine = await client.query(
          `SELECT id_vehiculo
           FROM aprendiz_vehiculo
           WHERE id_vehiculo = $1
           AND id_aprendiz = $2
           AND principal = TRUE`,
          [vehiculo.rows[0].id_vehiculo, id_aprendiz]
        );

        if (principalMachine.rowCount && principalMachine.rowCount > 0) {
          idMaquina = principalMachine.rows[0].id_vehiculo;
        } else {

          const otroAprendiz = await client.query(
            `SELECT id_vehiculo
             FROM aprendiz_vehiculo
             WHERE id_vehiculo = $1
             AND principal = TRUE`,
            [vehiculo.rows[0].id_vehiculo]
          );

          if (otroAprendiz.rowCount && otroAprendiz.rowCount > 0) {
            if (!forzarExcepcion) {
              return response.status(409).json({
                aviso: "diferenteAprendiz",
                tipoEquipo: "vehiculo",
                excepcion: true
              });
            }
            const yaPrestadoHoy = await client.query(`SELECT 1
            FROM detalles_maquinas dm
            JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
            WHERE dm.id_vehiculo = $1
            AND di.hora_ingreso >= CURRENT_DATE
            AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
            LIMIT 1`,vehiculo.rows[0].id_vehiculo)
            if (yaPrestadoHoy && !forzarExcepcion) {
              return response.status(409).json({
                aviso: "maquinaYaPrestadaHoy",
                excepcion: false
              });
            }
            idMaquina = vehiculo.rows[0].id_vehiculo;
          } else {
            return response.status(409).json({
              aviso: "maquinaSinDueño",
              tipoEquipo: "vehiculo",
              placa: vehiculo.rows[0].placa,
              modelo: vehiculo.rows[0].modelo,
              tipo_vehiculo: vehiculo.rows[0].tipo_vehiculo
            });
          }
        }

      } else {

        const principalRecord = await client.query(
          `SELECT v.placa
           FROM aprendiz_vehiculo av
           JOIN vehiculos v ON v.id_vehiculo = av.id_vehiculo
           WHERE av.id_aprendiz = $1
           AND av.principal = TRUE`,
          [id_aprendiz]
        );

        if (
          principalRecord.rowCount && principalRecord.rowCount > 0 &&
          principalRecord.rows[0].placa !== placaNormalizada
        ) {
          if (!forzarExcepcion) {
            return response.status(409).json({
              aviso: "maquinaPrincipalExistente",
              tipoEquipo: "vehiculo",
              excepcion: true
            });
          }
        }

        const result = await client.query(
          `WITH nuevo AS (
            INSERT INTO vehiculos(tipo_vehiculo, placa, modelo)
            VALUES ($2,$3,$4)
            RETURNING id_vehiculo
          )
          INSERT INTO aprendiz_vehiculo(id_aprendiz, id_vehiculo, principal)
          SELECT $1, id_vehiculo, TRUE FROM nuevo
          RETURNING id_vehiculo`,
          [id_aprendiz, tipoVehiculo, placaNormalizada, modeloNormalizado]
        );

        idMaquina = result.rows[0].id_vehiculo;
      }
    }

    // ================= COMPUTADORES =================
    if (tipoMaquina === 'pc') {
      const pc = await client.query(
        "SELECT * FROM computadores WHERE serial = $1",
        [placaNormalizada]
      );

      if (pc.rowCount && pc.rowCount > 0) {

        const principalMachine = await client.query(
          `SELECT id_computador
           FROM aprendiz_computador
           WHERE id_computador = $1
           AND id_aprendiz = $2
           AND principal = TRUE`,
          [pc.rows[0].id_computador, id_aprendiz]
        );

        if (principalMachine.rowCount && principalMachine.rowCount > 0) {
          idMaquina = principalMachine.rows[0].id_computador;
        } else {

          const otroAprendiz = await client.query(
            `SELECT id_computador
             FROM aprendiz_computador
             WHERE id_computador = $1
             AND principal = TRUE`,
            [pc.rows[0].id_computador]
          );

          if (otroAprendiz.rowCount && otroAprendiz.rowCount > 0) {
            if (!forzarExcepcion) {
              return response.status(409).json({
                aviso: "diferenteAprendiz",
                tipoEquipo: "computador",
                excepcion: true
              });
            }
            const yaPrestadoHoy = await client.query(`SELECT 1
            FROM detalles_maquinas dm
            JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
            WHERE dm.id_computador = $1
            AND di.hora_ingreso >= CURRENT_DATE
            AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
            LIMIT 1`,pc.rows[0].id_computador)
            if (yaPrestadoHoy && !forzarExcepcion) {
              return response.status(409).json({
                aviso: "maquinaYaPrestadaHoy",
                excepcion: false
              });
            }
            idMaquina = pc.rows[0].id_computador;
          } else {
            return response.status(409).json({
              aviso: "maquinaSinDueño",
              tipoEquipo: "computador",
              serial: pc.rows[0].serial,
              modelo: pc.rows[0].modelo
            });
          }
        }

      } else {

        const principalRecord = await client.query(
          `SELECT c.serial
           FROM aprendiz_computador ac
           JOIN computadores c ON c.id_computador = ac.id_computador
           WHERE ac.id_aprendiz = $1
           AND ac.principal = TRUE`,
          [id_aprendiz]
        );

        if (
          principalRecord.rowCount && principalRecord.rowCount > 0 &&
          principalRecord.rows[0].serial !== placaNormalizada
        ) {
          if (!forzarExcepcion) {
            return response.status(409).json({
              aviso: "maquinaPrincipalExistente",
              tipoEquipo: "computador",
              excepcion: true
            });
          }
        }

        const result = await client.query(
          `WITH nuevo AS (
            INSERT INTO computadores(serial, modelo)
            VALUES ($2,$3)
            RETURNING id_computador
          )
          INSERT INTO aprendiz_computador(id_aprendiz,id_computador,principal)
          SELECT $1, id_computador, TRUE FROM nuevo
          RETURNING id_computador`,
          [id_aprendiz, placaNormalizada, modeloNormalizado]
        );

        idMaquina = result.rows[0].id_computador;
      }
    }

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

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);

    return response.status(500).json({
      message: "Error interno del servidor"
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

  if (!id_aprendiz) {
    return response.status(400).json({
      message: "Debe enviar el id del aprendiz"
    })
  }

  try {

    const query = `
      SELECT
        c.marca AS pc_modelo,
        c.serial AS pc_serial,

        v.tipo_vehiculo,
        v.modelo AS vh_modelo,
        v.placa AS vh_placa,

        dm.firma_ingreso

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
      } : null,

      vh: data.vh_modelo ? {
        tipo_vehiculo: data.tipo_vehiculo,
        modelo: data.vh_modelo,
        placa_serial: data.vh_placa,
      } : null,
      firma: data.firma_ingreso   // 🔥 NUEVO
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
