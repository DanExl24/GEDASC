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
    const ingresoRecord = await pool.query(
      'SELECT * FROM detalles_ingreso WHERE id_aprendiz = $1',
      [id_aprendiz]
    );

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
export const DetectEntry = async (request : Request, response : Response) =>{
  try{
    const {documento} = request.params
    // Verificar si ya tiene ingreso
    const IngresoVerificado = await pool.query(
      'SELECT * FROM detalles_ingreso WHERE id_aprendiz = $1',
      [documento]
    );

    // si se encuentra un registro, no permitir un nuevo registro
    if (IngresoVerificado.rowCount! > 0) {
      return response.status(200).json({ message: "El aprendiz ya tiene un registro", yaIngresado : true }); //Si el aprendiz ya esta ingresado, se retorna el registro como verdadero
    }
    else{
      return response.status(200).json({ message: "El aprendiz no tiene un registro", yaIngresado : false }); //Si el aprendiz no esta ingresado, se retorna el registro como falso
    }

  } catch (error) {
    console.error(error);
    response.status(500).json({message:"Hay un error", error: error});
  }
}



// Funcion para el historial de ingresos
export const EntryRecord = async (request: Request, response: Response) => {
  try{
    // consulta de todos los aprendices
    const result = await pool.query("SELECT a.id_aprendiz, a.nombre, a.apellido, a.documento, f.nombre AS formacion, TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso, di.id_detallemaquina  FROM detalles_ingreso AS di JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz JOIN formaciones AS f ON f.id_formacion = a.id_formacion LEFT JOIN detalles_maquinas AS dm ON dm.id_detallemaquina = di.id_detallemaquina ORDER BY di.id_ingreso DESC");
    // verificar si hay aprendices
    if(result.rowCount===0){
      response.status(404).json({ message: "No se encontraron registros" });
      return;
    }
    // mandar resultados
    response.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({message:"Hay un error", error: error});
  }
}


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
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso
      FROM detalles_ingreso AS di
      JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
      JOIN formaciones AS f ON f.id_formacion = a.id_formacion
      WHERE
        a.documento ILIKE $1
        OR a.nombre ILIKE $1
        OR a.apellido ILIKE $1
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
      "WHERE di.id_aprendiz = $1 AND (dm.id_computador = $2 OR dm.id_vehiculo = $3)",
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
