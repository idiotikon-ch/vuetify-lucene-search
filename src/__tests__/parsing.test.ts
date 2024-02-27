import * as lucene from "lucene";
import { describe, expect, it } from 'vitest';
import type { PositiveOperator } from "../types";
import * as parsing from "../components/parsing";
import * as testValues from "./test-values";

function fail(message: string): never {
  throw new Error(message);
}

describe("filterToLuceneNode", () => {
  // String filters

  it("converts string filters to lucene nodes", () => {
    const value = "test";
    const node = parsing.filterToLuceneNode({
      field: testValues.stringField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.stringField.name);
    expect(node.term).toBe(value);
  });

  it("converts string filters with multi-word values to lucene nodes", () => {
    const value = "hello world";
    const node = parsing.filterToLuceneNode({
      field: testValues.stringField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.stringField.name);
    expect(node.term).toBe(value);
  });

  it("converts string filters with special characters in value to lucene nodes", () => {
    const values = [
      "-hello",
      "hello/world",
      "hello~world",
      "hello:world",
      "hell(o)",
      "h[ell]o",
    ];
    for (const value of values) {
      const node = parsing.filterToLuceneNode({
        field: testValues.stringField,
        value,
      }) as lucene.NodeTerm;
      expect(node.field).toBe(testValues.stringField.name);
      expect(node.term).toBe(value);
      expect(node.quoted).toBe(true);
    }
  });

  it("converts <implicit> field filters to lucene nodes", () => {
    const value = "test";
    const node = parsing.filterToLuceneNode({
      field: testValues.implicitField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe("<implicit>");
    expect(node.term).toBe(value);
  });

  // Number filters

  it("converts integer filters to lucene nodes", () => {
    const value = 3;
    const node = parsing.filterToLuceneNode({
      field: testValues.integerField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.integerField.name);
    expect(node.term).toBe(value.toString());
  });

  it("converts integer filters with negative values to lucene nodes", () => {
    const value = -3;
    const node = parsing.filterToLuceneNode({
      field: testValues.integerField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.integerField.name);
    expect(node.term).toBe(value.toString());
  });

  it("converts float filters to lucene nodes", () => {
    const value = 3.14;
    const node = parsing.filterToLuceneNode({
      field: testValues.floatField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.floatField.name);
    expect(node.term).toBe(value.toString());
  });

  it("converts float filters with negative values to lucene nodes", () => {
    const value = -3.14;
    const node = parsing.filterToLuceneNode({
      field: testValues.floatField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.floatField.name);
    expect(node.term).toBe(value.toString());
  });

  // Number range filters

  it("converts integer range filters to lucene nodes", () => {
    const value = [1, 3];
    const node = parsing.filterToLuceneNode({
      field: testValues.integerRangeField,
      value,
    }) as lucene.NodeRangedTerm;
    expect(node.field).toBe(testValues.integerRangeField.name);
    expect(node.term_min).toBe(value[0].toString());
    expect(node.term_max).toBe(value[1].toString());
  });

  it("converts float range filters to lucene nodes", () => {
    const value = [1.41, 3.14];
    const node = parsing.filterToLuceneNode({
      field: testValues.floatRangeField,
      value,
    }) as lucene.NodeRangedTerm;
    expect(node.field).toBe(testValues.floatRangeField.name);
    expect(node.term_min).toBe(value[0].toString());
    expect(node.term_max).toBe(value[1].toString());
  });

  // Boolean filters

  it("converts boolean filters to lucene nodes", () => {
    const value = true;
    const node = parsing.filterToLuceneNode({
      field: testValues.booleanField,
      value,
    }) as lucene.NodeTerm;
    expect(node.field).toBe(testValues.booleanField.name);
    expect(node.term).toBe(value.toString());
  });

  // Enum filters

  it("converts enum filters to lucene nodes", () => {
    const value = ["green", "blue"];
    const node = parsing.filterToLuceneNode({
      field: testValues.enumField,
      value,
    }) as lucene.BinaryAST;
    expect(node.field).toBe(testValues.enumField.name);
    expect(node.operator).toBe("OR");
    const left = node.left as lucene.NodeTerm;
    const right = node.right as lucene.LeftOnlyAST;
    expect(left.field).toBe("<implicit>");
    expect((left as lucene.NodeTerm).term).toBe("green");
    expect((right.left as lucene.NodeTerm).term).toBe("blue");
  });
});

describe("filterize", () => {
  // String filters

  it("converts lucene queries to string filters", () => {
    const field = testValues.stringField;
    const value = "test";
    const query = `${field.name}:${value}`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toBe(value);
  });

  it("converts lucene queries to string filters with multi-word values", () => {
    const field = testValues.stringField;
    const value = "hello world";
    const query = `${field.name}:"${value}"`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toBe(value);
  });

  it("converts lucene queries to string filters with special-characters in value", () => {
    const field = testValues.stringField;
    const values = [
      "-hello",
      "hello/world",
      "hello~world",
      "hello:world",
      "hell(o)",
      "h[ell]o",
    ];
    for (const value of values) {
      const query = `${field.name}:"${value}"`;
      const filters = parsing.filterize(lucene.parse(query), testValues.fields);
      if (filters === null) {
        fail("filterization failed");
      }
      expect(filters.length).toBe(1);
      expect(filters[0].field).toBe(field);
      expect(filters[0].value).toBe(value);
    }
  });

  // Number filters

  it("converts lucene queries to integer filters", () => {
    const field = testValues.integerField;
    const value = 3;
    const query = `${field.name}:${value}`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toBe(value);
  });

  it("converts lucene queries to float filters", () => {
    const field = testValues.floatField;
    const value = 0.3;
    const query = `${field.name}:${value}`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toBe(value);
  });

  // Number range filters

  it("converts lucene queries to integer range filters", () => {
    const field = testValues.integerRangeField;
    const value = [1, 3];
    const query = `${field.name}:[${value[0]} TO ${value[1]}]`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  it("converts lucene queries to float range filters", () => {
    const field = testValues.floatRangeField;
    const value = [0.1, 0.3];
    const query = `${field.name}:[${value[0]} TO ${value[1]}]`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  // Enum filters

  it("converts lucene queries to enum filters", () => {
    const field = testValues.enumField;
    const value = ["red", "blue"];
    const query = `${field.name}:(${value[0]} OR ${value[1]})`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  it("converts lucene queries to enum filters with single parenthesized value", () => {
    const field = testValues.enumField;
    const value = ["red"];
    const query = `${field.name}:(${value[0]})`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  it("converts lucene queries to enum filters with single unparenthesized value", () => {
    const field = testValues.enumField;
    const value = ["red"];
    const query = `${field.name}:${value[0]}`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  it("converts lucene queries to enum filters with multi-word values", () => {
    const field = testValues.enumField;
    const value = ["red", "black and white"];
    const query = `${field.name}:(${value[0]} OR "${value[1]}")`;
    const filters = parsing.filterize(lucene.parse(query), testValues.fields);
    if (filters === null) {
      fail("filterization failed");
    }
    expect(filters.length).toBe(1);
    expect(filters[0].field).toBe(field);
    expect(filters[0].value).toStrictEqual(value);
  });

  // Complex queries

  it("parsing a complex queries is the same as parsing its parts separately", () => {
    const subqueries = [
      "test",
      "string-field:hello",
      '"hello world"',
      'string-field:"good bye"',
      "enum-field:red",
      'enum-field:(red OR "black and white")',
      "float-range-field:[0.2 TO 0.6]",
    ];
    const subqueryFilters = [];
    for (const subquery of subqueries) {
      const filters = parsing.filterize(
        lucene.parse(subquery),
        testValues.fields
      );
      if (filters === null) {
        fail(`filterization failed for query '${subquery}'`);
      }
      expect(filters.length).toBe(1);
      subqueryFilters.push(filters[0]);
    }
    const query = subqueries.join(" ");
    const queryFilters = parsing.filterize(
      lucene.parse(query),
      testValues.fields
    );
    expect(queryFilters).toStrictEqual(subqueryFilters);
  });

  it("supports different operators", () => {
    const queries = [
      "string-field:first",
      "string-field:second",
      "integer-field:123",
    ];
    for (const operator of ["<implicit>", "AND", "OR"] as PositiveOperator[]) {
      const query = queries.join(
        operator === "<implicit>" ? " " : ` ${operator} `
      );
      const filters = parsing.filterize(
        lucene.parse(query),
        testValues.fields,
        operator
      );
      if (filters === null) {
        fail("filterization failed");
      }
      expect(filters.length).toBe(3);
      expect(filters[0].field.name).toBe("string-field");
      expect(filters[0].value).toBe("first");
      expect(filters[1].field.name).toBe("string-field");
      expect(filters[1].value).toBe("second");
      expect(filters[2].field.name).toBe("integer-field");
      expect(filters[2].value).toBe(123);
    }
  });

  it("supports negative filters", () => {
    const testCases = [
      {
        query: "NOT integer-field:123",
        expected: {
          positiveFilters: [],
          negativeFilters: [{ field: testValues.integerField, value: 123 }],
        },
      },
      {
        query: "string-field:first NOT string-field:second",
        expected: {
          positiveFilters: [{ field: testValues.stringField, value: "first" }],
          negativeFilters: [{ field: testValues.stringField, value: "second" }],
        },
      },
      {
        query: "NOT string-field:first string-field:second",
        expected: {
          positiveFilters: [{ field: testValues.stringField, value: "second" }],
          negativeFilters: [{ field: testValues.stringField, value: "first" }],
        },
      },
      {
        query: "NOT string-field:first NOT string-field:second",
        expected: {
          positiveFilters: [],
          negativeFilters: [
            { field: testValues.stringField, value: "first" },
            { field: testValues.stringField, value: "second" },
          ],
        },
      },
      {
        query:
          "NOT string-field:first string-field:second NOT string-field:third",
        expected: {
          positiveFilters: [{ field: testValues.stringField, value: "second" }],
          negativeFilters: [
            { field: testValues.stringField, value: "first" },
            { field: testValues.stringField, value: "third" },
          ],
        },
      },
    ];
    for (const { query, expected } of testCases) {
      const positiveFilters = parsing.filterize(
        lucene.parse(query),
        testValues.fields,
        "<implicit>",
        true
      );
      if (positiveFilters === null) {
        fail("filterization failed");
      }
      const negativeFilters = parsing.filterize(
        lucene.parse(query),
        testValues.fields,
        "<implicit>",
        false
      );
      if (negativeFilters === null) {
        fail("filterization failed");
      }
      expect(positiveFilters).toStrictEqual(expected.positiveFilters);
      expect(negativeFilters).toStrictEqual(expected.negativeFilters);
    }
  });

  it("rejects invalid values", () => {
    for (const query of [
      "integer-field:asdf",
      "integer-range-field:[- TO 1]",
      "boolean-field:asdf",
    ]) {
      expect(
        parsing.filterize(lucene.parse(query), testValues.fields)
      ).toBeNull();
    }
  });

  it("rejects unsupported query features", () => {
    for (const query of [
      "test~",
      "test~0.8",
      "string-field:test~0.8",
      "test^4",
      "string-field:test^4",
      "string-field:(hello AND world)",
      "hello OR world",
    ]) {
      expect(
        parsing.filterize(lucene.parse(query), testValues.fields)
      ).toBeNull();
    }
  });
});
