<template>
  <HeaderView -header-title="INGRESO DE APRENDICES AL CENTRO DE FORMACION"/>
  <ExitButton to="/"/>
  <div class="mx-20 my-3">
    <section class="flex items-center justify-between">
      <div class="flex items-center gap-2 w-4/5">
        <SearchBar/>
        <SearchUser/>
      </div>
      <BaseButton to="/" button-message="Registro Manual" button-class="w-full"/>
    </section>
  </div>
</template>
<script setup lang="ts">
import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
import SearchUser from '@/components/UI/SearchUser.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
</script>
<style>

</style>
