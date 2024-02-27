# `vuetify-lucene-search`

Advanced search Vuetify components supporting Lucene syntax. Currently not compiled, and only usable in TypeScript projects.

## Installing

`npm install git@git.idiotikon.ch:global/vuetify-lucene-search.git#<VERSION>`

Make sure every person and machine that needs to run `npm install` has read access to this repository.

## Usage

```html
<v-lucene-search-panel v-model="query" :fields="fields" operator="AND" negative>
  <!-- Slots for custom labels -->
  <template #positive-filters-prepend>Include:</template>
  <template #negative-filters-prepend>Exclude:</template>
  <template #add-filter-button-content>Add filter</template>
</v-lucene-search-panel>
```

```js
import { VLuceneSearchPanel } from "vuetify-lucene-search";

export default {
  components: {
    "v-lucene-search-panel": VLuceneSearchPanel
  },

  setup() {
    return {
      query: ref("harold AND age:45"),
      fields: [
        {
          name: "<implicit>",
          displayName: "Default field",
          type: "string",
          defaultValue: "",
        },
        {
          name: "age",
          displayName: "Age",
          type: "integer-range",
          defaultValue: [18, 65],
          constraints: { min: 0, max: 120 },
        },
      ],
    };
  },
};
```

See [types.ts](https://git.idiotikon.ch/global/vuetify-lucene-search/src/branch/main/src/types.ts) for all available field types and options.
