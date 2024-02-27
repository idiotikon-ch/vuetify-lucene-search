<template>
  <div>
    <!-- TODO: Refactor filter rows into separate component -->
    <v-row class="mt-4 text-left" align="center" no-gutters>
      <slot name="positive-filters-prepend">
        <div v-if="negative" class="mr-1">Einschliessen:</div>
      </slot>
      <VLuceneSearchFilter
        v-for="(filter, i) in positiveFilters"
        :key="`positiveFilter-${i}`"
        v-model="positiveFilters[i].value"
        class="mr-1"
        :field="filter.field"
        @update:model-value="updateQueryFromFilters()"
        @submit="$emit('submit')"
        @remove="removeFilter(i, true)"
      ></VLuceneSearchFilter>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-if="iconButton"
            v-bind="props"
            variant="outlined"
            :icon="mdiFilterPlus"
            density="comfortable"
            color="primary"
            class="mb-1"
            :disabled="invalid"
          />
          <v-btn
            v-else
            v-bind="props"
            variant="outlined"
            rounded
            :prepend-icon="mdiFilterPlus"
            color="primary"
            class="mb-1"
            :disabled="invalid"
          >
            <slot name="add-filter-button-content">
              Filter hinzufügen
            </slot>
          </v-btn>
        </template>
        <v-list
          :style="{ maxHeight: maxListHeight, 'overflow-y': 'auto' }"
          dense
        >
          <v-list-item
            v-for="field in fields"
            :key="`menu-item-${field.name}`"
            @click="addFilter(field, true)"
          >
            {{ field.displayName }}
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
    <v-row v-if="negative" class="mt-4 text-left" align="center" no-gutters>
      <slot name="negative-filters-prepend">
        <div v-if="negative" class="mr-1">Ausschliessen:</div>
      </slot>
      <VLuceneSearchFilter
        v-for="(filter, i) in negativeFilters"
        :key="`negativeFilter-${i}`"
        v-model="negativeFilters[i].value"
        class="mr-1"
        :field="filter.field"
        @update:model-value="updateQueryFromFilters()"
        @submit="$emit('submit')"
        @remove="removeFilter(i, false)"
      ></VLuceneSearchFilter>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-if="iconButton"
            v-bind="props"
            variant="outlined"
            :icon="mdiFilterPlus"
            density="comfortable"
            color="primary"
            class="mb-1"
            :disabled="invalid"
          />
          <v-btn
            v-else
            v-bind="props"
            variant="outlined"
            rounded
            :prepend-icon="mdiFilterPlus"
            color="primary"
            class="mb-1"
            :disabled="invalid"
          >
            <slot name="add-filter-button-content">
              Filter hinzufügen
            </slot>
          </v-btn>
        </template>
        <v-list
          :style="{ maxHeight: maxListHeight, 'overflow-y': 'auto' }"
          dense
        >
          <v-list-item
            v-for="field in fields"
            :key="`menu-item-${field.name}`"
            @click="addFilter(field, false)"
          >
            {{ field.displayName }}
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
  </div>
</template>

<script lang="ts">
import * as lucene from "lucene";
import type { PropType } from "vue";
import type { Filter, FilterField, PositiveOperator } from "../types";
import VLuceneSearchFilter from "./Filter.vue";
import { filterize, filterToLuceneNode, negateOperator } from "./parsing";
import { mdiFilterPlus } from "@mdi/js";

export default {
  name: "VLuceneSearchPanel",

  components: {
    VLuceneSearchFilter,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },

    fields: {
      type: Array as PropType<FilterField[]>,
      required: true,
    },

    operator: {
      type: String as PropType<PositiveOperator>,
      default: "<implicit>",
      validator: (value: string) => ["<implicit>", "AND", "OR"].includes(value),
    },

    iconButton: {
      type: Boolean,
      default: false,
    },

    negative: {
      type: Boolean,
      default: false,
    },

    menuHeight: {
      type: Number,
      required: false,
    },
  },

  data() {
    return {
      positiveFilters: [] as Filter[],
      negativeFilters: [] as Filter[],
      leadingWhitespace: "",
      trailingWhitespace: "",
      invalid: false,
      mdiFilterPlus,
    };
  },

  watch: {
    modelValue() {
      this.updateFiltersFromQuery();
    },
  },

  mounted() {
    this.updateFiltersFromQuery();
  },

  computed: {
    maxListHeight(): string | undefined {
      if (this.menuHeight === undefined) {
        return undefined;
      }
      return this.menuHeight.toString() + "px";
    },
  },

  methods: {
    removeFilter(index: number, positive: boolean) {
      const filters = positive ? this.positiveFilters : this.negativeFilters;
      filters.splice(index, 1);
      this.updateQueryFromFilters();
    },

    addFilter(field: FilterField, positive: boolean) {
      const filters = positive ? this.positiveFilters : this.negativeFilters;
      filters.push({
        field,
        value: field.defaultValue,
      });
      this.updateQueryFromFilters();
    },

    updateFiltersFromQuery() {
      this.positiveFilters = [];
      this.negativeFilters = [];

      const match = this.modelValue.match(/^(\s*)(.*?)(\s*)$/);
      if (match !== null) {
        [, this.leadingWhitespace, , this.trailingWhitespace] = match;
      }

      if (this.modelValue.trim() === "") {
        // Query is empty -> give up
        this.leadingWhitespace = this.modelValue;
        this.trailingWhitespace = "";
        this.invalid = false;
        return;
      }

      let ast: lucene.AST;
      try {
        ast = lucene.parse(this.modelValue);
      } catch {
        // Not a valid AST -> give up
        this.leadingWhitespace = this.modelValue;
        this.trailingWhitespace = "";
        this.invalid = true;
        return;
      }

      const maybePositiveFilters = filterize(
        ast,
        this.fields,
        this.operator as PositiveOperator,
        true
      );
      if (maybePositiveFilters === null) {
        // Filterization failed -> give up
        this.leadingWhitespace = this.modelValue;
        this.trailingWhitespace = "";
        this.invalid = true;
        return;
      } else {
        this.positiveFilters = maybePositiveFilters;
        const maybeNegativeFilters = filterize(
          ast,
          this.fields,
          this.operator as PositiveOperator,
          false
        );
        if (maybeNegativeFilters === null) {
          // Filterization failed -> give up
          this.leadingWhitespace = this.modelValue;
          this.trailingWhitespace = "";
          this.invalid = true;
          return;
        } else {
          this.negativeFilters = maybeNegativeFilters;
        }
      }
      this.invalid = false;
    },

    updateQueryFromFilters() {
      // Convert filters to AST nodes
      const positiveNodes = this.positiveFilters
        .map(filterToLuceneNode)
        .map((node) => ({ node, not: false }));
      const negativeNodes = this.negativeFilters
        .map(filterToLuceneNode)
        .map((node) => ({ node, not: true }));
      const nodes = [...positiveNodes, ...negativeNodes];

      // Build AST with nested nodes
      const negativeOperator = negateOperator(
        this.operator as PositiveOperator
      );
      let filterAST: lucene.AST | null = null;
      if (nodes.length > 0) {
        filterAST = {
          left: nodes[0].node,
          start: nodes[0].not ? "NOT" : undefined,
        };
        let subAST = filterAST;
        for (let i = 1; i < nodes.length; i++) {
          const extendedSubAST = subAST as lucene.BinaryAST;
          const operator = (
            nodes[i].not ? negativeOperator : this.operator
          ) as lucene.Operator;
          extendedSubAST.operator = operator;
          extendedSubAST.right = {
            left: nodes[i].node,
          };
          subAST = extendedSubAST.right;
        }
      }

      // Build query string from ASTs
      let query = this.leadingWhitespace;
      if (filterAST !== null) {
        query += lucene.toString(filterAST);
      }
      query += this.trailingWhitespace;

      this.$emit("update:modelValue", query);
    },
  },
};
</script>
