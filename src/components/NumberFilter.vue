<template>
  <v-slider
    class="mt-5"
    style="width: 250px"
    :step="precision"
    :min="computedMin"
    :max="computedMax"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #append>
      <span class="text-caption font-weight-bold">{{ modelValue }}</span>
    </template>
  </v-slider>
</template>

<script lang="ts">
export default {
  name: "VLuceneSearchNumberFilter",

  props: {
    modelValue: {
      type: Number,
      required: true,
    },

    precision: {
      type: Number,
      required: true,
    },

    min: {
      type: Number,
      required: true,
    },

    max: {
      type: Number,
      required: true,
    },
  },

  computed: {
    computedMin(): number {
      return Math.min(this.min, this.modelValue);
    },

    computedMax(): number {
      return Math.max(this.max, this.modelValue);
    },
  },
};
</script>
