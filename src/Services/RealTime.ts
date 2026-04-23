export const getRealTimeNow = (date? : Date) => {
      let thisDate = null
      if(date){
        thisDate = date
      }
      else{
        thisDate = new Date()
      }
      if (!thisDate){
        return
      }
      const hour = thisDate.getHours()
      const minutes = thisDate.getMinutes().toString().padStart(2, '0')
      const seconds = thisDate.getSeconds().toString().padStart(2, '0')
      const type = hour < 12 ? 'AM' : 'PM'

      let normalizeHour = hour < 12 ? hour : hour-12
      if(normalizeHour == 0){
        normalizeHour = 12
      }
      return `${normalizeHour}:${minutes}:${seconds} ${type}`
  }
