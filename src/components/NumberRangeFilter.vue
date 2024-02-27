<template>
  <v-range-slider
    class="mt-5"
    style="width: 250px"
    :step="precision"
    :min="computedMin"
    :max="computedMax"
    :model-value="computedValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <span
        class="text-caption text-right font-weight-bold"
        style="min-width: 30px"
        >{{ computedValue[0] }}</span
      >
    </template>
    <template #append>
      <span
        class="text-caption text-left font-weight-bold"
        style="min-width: 30px"
        >{{ computedValue[1] }}</span
      >
    </template>
  </v-range-slider>
</template>

<script lang="ts">
import type { PropType } from "vue";

export default {
  name: "VLuceneSearchNumberRangeFilter",

  props: {
    modelValue: {
      type: Array as PropType<number[]>,
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
      return Math.min(this.min, ...this.modelValue);
    },

    computedMax(): number {
      return Math.max(this.max, ...this.modelValue);
    },

    computedValue(): number[] {
      if (this.modelValue[0] > this.modelValue[1]) {
        return [this.modelValue[1], this.modelValue[0]];
      }
      return this.modelValue;
    },
  },
};
</script>
