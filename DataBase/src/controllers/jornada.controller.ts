import { Request, Response } from 'express'
import { pool } from '../config/db'


export const realTimeNow = async (request: Request, response : Response) => {
  try {
    const newTime = await pool.query("SELECT NOW() AS current_time")
    response.status(200).json({time:newTime.rows[0].current_time})
  } catch (error){
    response.status(400).json({message:'Error al obtener la hora'})
    console.log(error)
  }

}
