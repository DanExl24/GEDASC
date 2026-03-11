<template>
  <!--Columnas de la tabla -->
  <tr class="border-collapse text-center border border-black">
    <slot></slot>
  </tr>
</template>

<script setup lang="ts">

</script>

<style>
tr td{
  border: solid black 1px;
  padding: 0.5rem 0 0.5rem 0;
}
</style>
