<template>
  <!-- Tarjeta -->
  <router-link :to="ViewLink">
    <div :class="[
      CardBg,
      'w-auto flex bg-senaColor border rounded-lg items-center gap-5 mx-10 lg:m-12 py-10 px-5 lg:p-5 shadow-md cursor-pointer transition-transform ease-in hover:scale-105 duration-800',
      !CardImg ? 'justify-center text-center' : ''
    ]">
    <!-- Fondo de la imagen -->

    <div v-if="CardImg" :class="[ImgBg,'p-2 border rounded-lg lg:w-2/4']">
      <img :src="CardImg" alt="">
    </div>
    <!-- Texto de la tarjeta -->
    <p
      :class="[colorTextCard, !CardImg ? 'w-full' : '']"
      class="text-robotoSlab font-semibold text-md lg:text-lg"
    >
      {{ cardText }}
    </p>
  </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';


// Props del Componente y defaults
const props = withDefaults(defineProps<{
  cardText? : string,
  CardBg? : 'white' | 'green',
  CardImg? : string,
  ViewLink? : string,
}>(),
  {
    cardText : "Consulte acerca de los aprendices ingresados al CTA",
    CardBg : 'white',
    ViewLink : '/'
  }
)

// Logica para el prop CardBg y su valor de retorno
const CardBg = computed(()=>{
  if(props.CardBg == 'white') return 'bg-white'
  else return 'bg-senaColor'
})

// Logica para el prop ImgBg y su valor de retorno
const ImgBg = computed(()=>{
  if(props.CardBg == 'white') return 'bg-senaColor'
  else return 'bg-white'
})

// Logica para el prop colorTextCard y su valor de retorno, cambiando el color del texto de la carta
const colorTextCard = computed(()=>{
  if(props.CardBg == 'white') return 'text-black'
  else return 'text-white'
})

</script>
<style>
</style>
