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
    const result = await pool.query("SELECT a.id_aprendiz, a.nombre, a.apellido, a.documento, f.nombre AS formacion, TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso FROM detalles_ingreso AS di JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz JOIN formaciones AS f ON f.id_formacion = a.id_formacion");
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
export const AddMachine = async(request : Request, response : Response)=>{
  try{

  } catch (error) {
    console.error(error)
    response.status(500).json({
      message: "Error en el ingreso de maquina",
      error : error
    })
  }
}
