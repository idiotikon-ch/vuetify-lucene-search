<template>
  <v-chip class="mb-1" :ripple="false" @click:close="$emit('remove')">
    <span v-if="field.displayName" class="text-overline mr-1 text-truncate"
      >{{ field.displayName }}:</span
    >
    <VLuceneSearchStringFilter
      v-if="field.type === 'string'"
      :model-value="(modelValue as string)"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit')"
    ></VLuceneSearchStringFilter>
    <VLuceneSearchNumberFilter
      v-if="field.type === 'integer' || field.type === 'float'"
      :precision="field.type === 'integer' ? 1 : 0.01"
      :min="field.constraints.min"
      :max="field.constraints.max"
      :model-value="modelValue as number"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit')"
    ></VLuceneSearchNumberFilter>
    <VLuceneSearchNumberRangeFilter
      v-if="field.type === 'integer-range' || field.type === 'float-range'"
      :precision="field.type === 'integer-range' ? 1 : 0.01"
      :min="field.constraints.min"
      :max="field.constraints.max"
      :model-value="modelValue as number[]"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit')"
    ></VLuceneSearchNumberRangeFilter>
    <VLuceneSearchBooleanFilter
      v-if="field.type === 'boolean'"
      :model-value="modelValue as boolean"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit')"
    ></VLuceneSearchBooleanFilter>
    <VLuceneSearchEnumFilter
      v-if="field.type === 'enum'"
      :items="field.constraints.options"
      :model-value="modelValue as string[]"
      :autocomplete="field.autocomplete"
      @update:model-value="$emit('update:modelValue', $event)"
      @submit="$emit('submit')"
    ></VLuceneSearchEnumFilter>
    <template #append>
      <v-icon class="ml-1 mr-n1" :icon="mdiCloseCircle" size="small" @click="$emit('remove')"> </v-icon>
    </template>
  </v-chip>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { FilterField } from '../types'
import VLuceneSearchBooleanFilter from './BooleanFilter.vue'
import VLuceneSearchEnumFilter from './EnumFilter.vue'
import VLuceneSearchNumberFilter from './NumberFilter.vue'
import VLuceneSearchNumberRangeFilter from './NumberRangeFilter.vue'
import VLuceneSearchStringFilter from './StringFilter.vue'
import { mdiCloseCircle } from '@mdi/js'

export default {
  name: 'VLuceneSearchFilter',

  components: {
    VLuceneSearchStringFilter,
    VLuceneSearchNumberFilter,
    VLuceneSearchNumberRangeFilter,
    VLuceneSearchBooleanFilter,
    VLuceneSearchEnumFilter
  },

  data() {
    return {
      mdiCloseCircle
    }
  },

  props: {
    field: {
      type: Object as PropType<FilterField>,
      required: true
    },

    modelValue: {
      required: true
    }
  }
}
</script>
