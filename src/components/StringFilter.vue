<template>
  <v-text-field
    class="text-body-2 font-weight-bold mb-2"
    style="width: 170px"
    variant="underlined"
    density="compact"
    hide-details
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @keyup.enter="$emit('submit')"
  ></v-text-field>
</template>

<script lang="ts">
export default {
  name: "VLuceneSearchStringFilter",

  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
};
</script>
