<template>
  <div class="relative">
    <HeaderView -header-title="INGRESO DE APRENDICES AL CENTRO DE FORMACION"/>
    <div class="flex relative overflow-hidden justify-between">
      <ExitButton to="/"/>
      <BaseButtonOpen @click="open" :image="codebar" text="Escanear Aprendiz"/>
    </div>
      <BarcodeScanner ref="scannerModal"/>
    <div class="mx-20 my-3">
      <section class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-2 w-4/5">
          <SearchBar/>
          <SearchUser/>
        </div>
        <BaseButton to="/" button-message="Registro Manual" button-class="w-full"/>
      </section>
      <BaseTable>
        <BaseColumn>
          <BaseTableHead name="Nombre"/>
          <BaseTableHead name="Apellido"/>
          <BaseTableHead name="DNI"/>
          <BaseTableHead name="Nombre de la Formacion"/>
          <BaseTableHead name="Hora de Ingreso"/>
          <BaseTableHead name="Registro de Maquina"/>
        </BaseColumn>
      </BaseTable>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
import SearchUser from '@/components/UI/SearchUser.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
import BaseTable from '@/components/Tables/BaseTable.vue';
import BaseColumn from '@/components/Tables/BaseColumn.vue';
import BaseTableHead from '@/components/Tables/BaseTableHead.vue';
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue';
import codebar from '@/assets/Icons/barcodeScanner.png'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue';

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)

const open = () => {
  scannerModal.value?.openScanner()
}


</script>
<style>

</style>
