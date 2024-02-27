<template>
  <v-app data-app>
    <v-main>
      <v-container fluid>
        <h1 class="text-h2">vuetify-lucene-search example</h1>
        <v-text-field
          v-model="query"
          placeholder="Search"
          hide-details
        ></v-text-field>
        <v-lucene-search-panel
          v-model="query"
          :fields="fields"
          operator="AND"
          :menu-height="200"
          negative
          @submit="submit"
        >
          <template v-slot:add-filter-button-content>New filter</template>
        </v-lucene-search-panel>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FilterField } from "@/index";
import { VLuceneSearchPanel } from "@/index";

const fields: FilterField[] = [
  {
    name: "<implicit>",
    displayName: "Default field",
    type: "string",
    defaultValue: "",
  },
  {
    name: "name",
    displayName: "Name",
    type: "string",
    defaultValue: "",
  },
  {
    name: "age",
    displayName: "Age",
    type: "integer",
    defaultValue: 25,
    constraints: { min: 0, max: 120 },
  },
  {
    name: "auditory-threshold",
    displayName: "Auditory threshold (dB)",
    type: "integer-range",
    defaultValue: [70, 180],
    constraints: { min: -100, max: 200 },
  },
  {
    name: "likes-cats",
    displayName: "Likes cats",
    type: "boolean",
    defaultValue: false,
  },
  {
    name: "language",
    displayName: "Native language",
    type: "enum",
    defaultValue: ["english"],
    autocomplete: true,
    constraints: {
      options: {
        english: "English",
        german: "German",
        french: "French",
        greek: "Greek",
        norse: "Old Norse",
        manchu: "Manchu",
        hittite: "Hittite",
        klingon: "Klingon",
      },
    },
  },
  {
    name: "odour",
    displayName: "Odour",
    type: "enum",
    defaultValue: [],
    autocomplete: false,
    constraints: {
      options: {
        nice: "nice",
        stingy: "stingy",
        sweet: "sweet",
      },
    },
  },
];

const query = ref("asdf");

function submit() {
  alert("submit");
}
</script>
