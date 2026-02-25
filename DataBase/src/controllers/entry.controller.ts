// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

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

export const EntryRecord = async (request: Request, response: Response) => {
  try{
    // consulta de todos los aprendices
    const result = await pool.query("SELECT a.id_aprendiz, a.nombre, a.apellido, a.documento, f.nombre AS formacion, TO_CHAR(di.hora_ingreso, 'HH24:MI') AS hora_ingreso FROM detalles_ingreso AS di JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz JOIN formaciones AS f ON f.id_formacion = a.id_formacion");
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
