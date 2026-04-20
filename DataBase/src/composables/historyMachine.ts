export const historyMachine = (whereClause? : string) => {
  const query = (`
    SELECT
      a.id_aprendiz,
      a.nombre,
      a.apellido,
      c.marca AS pcMarca,
      c.serial AS pcSerial,
      v.modelo AS vhMarca,
      v.placa AS vhPlaca,
      v.tipo_vehiculo AS vhTipo,
      a.documento,
      f.nombre AS formacion,
      TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
      TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida,
      di.id_detallemaquina,
      di.id_ingreso
    FROM detalles_ingreso AS di
    JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    INNER JOIN detalles_maquinas AS dm ON dm.id_detallemaquina = di.id_detallemaquina
    LEFT JOIN computadores c
      ON dm.id_computador = c.id_computador
    LEFT JOIN vehiculos v
      ON dm.id_vehiculo = v.id_vehiculo
    JOIN formaciones f ON f.id_formacion = a.id_formacion
    ${whereClause}
    ORDER BY di.hora_ingreso DESC
  `)
  return query
}
