import type { FilterField } from "../types";

let numFields = 0;

function newField(field: FilterField): FilterField {
  numFields++;
  return field;
}

export const implicitField = newField({
  name: "<implicit>",
  displayName: "Default field",
  type: "string",
  defaultValue: "test",
});

export const stringField = newField({
  name: "string-field",
  displayName: "String field",
  type: "string",
  defaultValue: "test",
});

export const integerField = newField({
  name: "integer-field",
  displayName: "Integer field",
  type: "integer",
  defaultValue: 5,
  constraints: { min: 0, max: 10 },
});

export const floatField = newField({
  name: "float-field",
  displayName: "Float field",
  type: "float",
  defaultValue: 0.5,
  constraints: { min: 0, max: 1 },
});

export const integerRangeField = newField({
  name: "integer-range-field",
  displayName: "Integer range field",
  type: "integer-range",
  defaultValue: [2, 8],
  constraints: { min: 0, max: 10 },
});

export const floatRangeField = newField({
  name: "float-range-field",
  displayName: "Float range field",
  type: "float-range",
  defaultValue: [0.2, 0.8],
  constraints: { min: 0, max: 1 },
});

export const booleanField = newField({
  name: "boolean-field",
  displayName: "Boolean field",
  type: "boolean",
  defaultValue: false,
});

export const enumField = newField({
  name: "enum-field",
  displayName: "Enum field",
  type: "enum",
  defaultValue: ["red"],
  autocomplete: true,
  constraints: {
    options: {
      red: "Red",
      green: "Green",
      blue: "Blue-ish",
      "black and white": "Black and white",
    },
  },
});

export const fields: FilterField[] = [
  implicitField,
  stringField,
  integerField,
  floatField,
  integerRangeField,
  floatRangeField,
  booleanField,
  enumField,
];

if (fields.length !== numFields) {
  throw Error(
    `\`test-values.ts\` defines ${numFields} fields, ` +
      `but its \`fields\` array only has ${fields.length} elements.`
  );
}
