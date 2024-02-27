<template>
  <v-autocomplete
    v-if="autocomplete"
    class="text-body-2 font-weight-bold mb-2"
    variant="underlined"
    density="compact"
    hide-details
    multiple
    :items="selectItems"
    :modelValue="modelValue"
    @update:model-value="$emit('update:modelValue', removeEmpty($event))"
    @keyup.enter="$emit('submit')"
  ></v-autocomplete>
  <v-select
    v-else
    class="text-body-2 font-weight-bold mb-2"
    variant="underlined"
    density="compact"
    hide-details
    multiple
    :items="selectItems"
    :modelValue="modelValue"
    @update:model-value="$emit('update:modelValue', removeEmpty($event))"
  ></v-select>
</template>

<script lang="ts">
import type { PropType } from "vue";

export default {
  name: "VLuceneSearchEnumFilter",

  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      required: true,
    },
    items: {
      type: Object as PropType<{ [value: string]: string }>,
      required: true,
    },
    autocomplete: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    selectItems(): { title: string; value: string }[] {
      return Object.keys(this.items).map((value) => ({
        value,
        title: this.items[value],
      }));
    },
  },

  methods: {
    removeEmpty(values: string[]) {
      return values.filter((value) => value !== "");
    },
  },
};
</script>
