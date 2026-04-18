import { connectSocket } from '@/socket'
import { ref } from 'vue'
import router from '@/router'
const socket = connectSocket()
export const  documentoAprendiz = ref<string | undefined>();
let initialized = false
export const InitSocketsEvent = () => {
  if (initialized) return
  initialized = true

  socket.on('connect', () => {
    console.log('Móvil conectado, id socket:', socket.id);
    socket.emit('registrarMovil', { dispositivo: 'movil' });
  });
  socket.on("cerrarFirmaEnMovil", ({ documento }) => {
    console.log("Cerrar firma en móvil:", documento)
  })
  socket.on('abrirFirma', ({ documento }) => {
    documentoAprendiz.value = documento
    router.push(`/mobile-view/firma/${documento}`)
  })


}
