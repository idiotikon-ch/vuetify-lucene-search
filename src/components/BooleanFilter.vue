<template>
  <v-checkbox
    class="mt-5"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  ></v-checkbox>
</template>

<script lang="ts">
export default {
  name: "VLuceneSearchBooleanFilter",

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
};
</script>
