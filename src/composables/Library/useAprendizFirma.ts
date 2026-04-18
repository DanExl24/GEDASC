import SignaturePad from "signature_pad";
import { ref, onMounted, type Ref } from "vue";

export const useAprendizFirma = (canvas : Ref<HTMLCanvasElement | null> ) => {
  const signaturePad = ref<SignaturePad | null>(null);

  onMounted(() => {
    if (!canvas.value) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.value.width = canvas.value.offsetWidth * ratio;
    canvas.value.height = canvas.value.offsetHeight * ratio;

    const ctx = canvas.value.getContext("2d");
    ctx?.scale(ratio, ratio);

    signaturePad.value = new SignaturePad(canvas.value, {
      penColor: "black",
      backgroundColor: "rgba(255,255,255,0)",
    });
  });

  const limpiar = () => {
    signaturePad.value?.clear();
  };

  const guardar = (): string | null => {
    if (!signaturePad.value || signaturePad.value.isEmpty()) {
      alert("La firma está vacía");
      return null;
    }

    return canvas.value?.toDataURL("image/png") || null;
  };

  return {
    canvas,
    limpiar,
    guardar,
  };
};
