<template>
  <section class="bg-gray-100 min-h-screen">
    <!-- Header del componente -->
    <HeaderView/>
      <p class=" py-5 text-gray-500 w-1/2 m-auto text-center font-quicksand text-2xl font-semibold">Toma el control para registrar la entrada y Salida tanto de aprendices como de equipos de computo o vehiculos.</p>
      <div class="grid grid-cols-3 w-full">
        <!-- Tarjetas del dashboard -->
        <BaseCard -view-link="/general-entry" :-card-img="registerPerson"/>
        <BaseCard -view-link="/general-exit" :-card-img="ExitDoor" card-text="Consulte acerca de los aprendices que han salido del CTA"/>
        <BaseCard -view-link="/general-history" :-card-img="RecordPaper" card-text="Registro historico sobre entradas y salidas en el CTA"/>

        <BaseCard -view-link="/computer-history" -card-bg="green" :-card-img="SendComputer" card-text="Equipos de Computo que han sido ingresados en el CTA"/>
        <BaseCard -view-link="/vehicle-history" -card-bg="green" :-card-img="BikeGreen" card-text="Motocicletas que han sido ingresadas en el CTA"/>
      </div>
  </section>
</template>

<script setup lang="ts">
// Importar Componentes
import HeaderView from '@/layouts/HeaderView.vue';
import BaseCard from '@/components/Cards/BaseCard.vue';
// Importar Iconos de tarjetas
import registerPerson from '@/assets/Icons/registerPerson.png'
import ExitDoor from '@/assets/Icons/ExitDoor.png'
import RecordPaper from '@/assets/Icons/RecordPaper.png'
import SendComputer from '@/assets/Icons/SendComputer.png'
import BikeGreen from '@/assets/Icons/BikeGreen.png'
</script>

<style scoped>
</style>
