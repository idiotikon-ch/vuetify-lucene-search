import * as lucene from "lucene";
import type { PositiveOperator, Filter, FilterField } from "../types";

export function negateOperator(operator: PositiveOperator): lucene.Operator {
  switch (operator) {
    case "<implicit>":
      return "NOT";
    case "AND":
      return "AND NOT";
    case "OR":
      return "OR NOT";
  }
}

function hasSpecialCharacters(value: string): boolean {
  return /^[+-]|[\s/~^:(){}[\]]/g.test(value);
}

export function filterToLuceneNode(filter: Filter): lucene.Node | lucene.AST {
  if (
    filter.field.type === "integer-range" ||
    filter.field.type === "float-range"
  ) {
    return {
      field: filter.field.name,
      fieldLocation: null,
      term_min: filter.value[0].toString(),
      term_max: filter.value[1].toString(),
      inclusive: "both",
    };
  } else if (filter.field.type === "enum") {
    const rootTerm = filter.value.length > 0 ? filter.value[0] : "";
    const rootNode: lucene.LeftOnlyAST = {
      field: filter.field.name,
      fieldLocation: null,
      left: {
        field: "<implicit>",
        fieldLocation: null,
        term: rootTerm.toString(),
        termLocation: {
          start: { column: 0, line: 0, offset: 0 },
          end: { column: 0, line: 0, offset: 0 },
        },
        boost: null,
        prefix: null,
        quoted: hasSpecialCharacters(rootTerm) || rootTerm === "", // TODO: Escape quotes, parentheses
        regex: false,
        similarity: null,
      },
      parenthesized: filter.value.length > 0,
    };
    let subAST = rootNode as lucene.AST;
    for (let i = 1; i < filter.value.length; i++) {
      const extendedSubAST = subAST as lucene.BinaryAST;
      extendedSubAST.operator = "OR";
      const rightTerm = filter.value[i];
      extendedSubAST.right = {
        field: "<implicit>",
        fieldLocation: null,
        left: {
          field: "<implicit>",
          fieldLocation: null,
          term: rightTerm.toString(),
          termLocation: {
            start: { column: 0, line: 0, offset: 0 },
            end: { column: 0, line: 0, offset: 0 },
          },
          boost: null,
          prefix: null,
          quoted: hasSpecialCharacters(rightTerm) || rightTerm === "", // TODO: Escape quotes, parentheses
          regex: false,
          similarity: null,
        },
      };
      subAST = extendedSubAST.right;
    }
    return rootNode;
  } else {
    return {
      field: filter.field.name,
      fieldLocation: null,
      term: filter.value.toString(),
      termLocation: {
        start: { column: 0, line: 0, offset: 0 },
        end: { column: 0, line: 0, offset: 0 },
      },
      boost: null,
      prefix: null,
      quoted:
        hasSpecialCharacters(filter.value) ||
        filter.value === "" ||
        (typeof filter.value === "number" && filter.value < 0), // TODO: Escape special characters
      regex: false,
      similarity: null,
    };
  }
}

function luceneNodeToFilter(
  node: lucene.Node,
  field: FilterField
): Filter | null {
  if ("term_min" in node) {
    if (!field.type.endsWith("-range")) {
      // `node` is ranged, but `field` isn't -> not supported
      return null;
    }
    let value: [number, number];
    switch (field.type) {
      case "integer-range":
        value = [parseInt(node.term_min), parseInt(node.term_max)];
        if (isNaN(value[0]) || isNaN(value[1])) {
          // Not a number -> give up
          return null;
        }
        break;
      case "float-range":
        value = [parseFloat(node.term_min), parseFloat(node.term_max)];
        if (isNaN(value[0]) || isNaN(value[1])) {
          // Not a number -> give up
          return null;
        }
        break;
      default:
        throw `Unhandled field type "${field.type}"`;
    }
    return {
      field,
      value,
    };
  } else {
    if (field.type.endsWith("-range")) {
      // `field` is ranged, but `node` isn't -> not supported
      return null;
    }
    let value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (field.type) {
      case "string":
        value = node.term;
        break;
      case "integer":
        value = parseInt(node.term);
        if (isNaN(value)) {
          // Not a number -> give up
          return null;
        }
        break;
      case "float":
        value = parseFloat(node.term);
        if (isNaN(value)) {
          // Not a number -> give up
          return null;
        }
        break;
      case "boolean":
        if (node.term === "true") {
          value = true;
        } else if (node.term === "false") {
          value = false;
        } else {
          // Not a boolean value -> give up
          return null;
        }
        break;
      case "enum":
        value = [node.term];
        break;
      default:
        throw `Unhandled field type "${field.type}"`;
    }
    return {
      field,
      value,
    };
  }
}

export function filterize(
  node: lucene.Node | lucene.AST,
  fields: FilterField[],
  operator: PositiveOperator = "<implicit>",
  positive = true,
  initial = true
): Filter[] | null {
  if (!("left" in node)) {
    // `node` is a single node
    if (
      ("boost" in node && node.boost !== null) ||
      ("prefix" in node && node.prefix !== null) ||
      ("regex" in node && node.regex !== false) ||
      ("similarity" in node && node.similarity !== null)
    ) {
      // Unsupported filter feature -> give up
      return null;
    }
    const field = fields.find((field) => field.name === node.field);
    if (field === undefined) {
      // Unknown field -> give up
      return null;
    }
    const filter = luceneNodeToFilter(node, field);
    if (filter === null) {
      // Node incompatible with field
      return null;
    }
    return [filter];
  } else {
    // `node` is an AST
    if ("field" in node) {
      // Left side is an AST used as a node, e.g. field:(term1 OR term2)
      const field = fields.find((field) => field.name === node.field);
      if (field === undefined || field.type !== "enum") {
        // Unknown field or unsupported field type for parenthesized nodes -> give up
        return null;
      }
      const terms = getEnumFilterTerms(node);
      if (terms === null) {
        // Enum terms couldn't be parsed -> give up
        return null;
      }
      return [
        {
          field,
          value: terms,
        },
      ];
    }
    let leftFilters = filterize(node.left, fields, operator, positive, false);
    if (leftFilters === null) {
      // Left side couldn't be filterized -> give up
      return null;
    }
    const startNot = "start" in node && node.start === "NOT";
    if (initial && ((positive && startNot) || (!positive && !startNot))) {
      // The inverse of the operator we're looking for -> exclude this filter
      leftFilters = leftFilters.slice(1);
    }
    if ("right" in node) {
      // `node` is a binary AST
      let rightFilters = filterize(
        node.right,
        fields,
        operator,
        positive,
        false
      );
      if (rightFilters === null) {
        // Right side couldn't be filterized -> give up
        return null;
      }
      const operatorPositive = node.operator === operator;
      const operatorNegative = node.operator === negateOperator(operator);
      if (!operatorPositive && !operatorNegative) {
        // Unsupported operator -> give up
        return null;
      }
      if ((!positive && operatorPositive) || (positive && operatorNegative)) {
        // The inverse of the operator we're looking for -> exclude the next filter
        rightFilters = rightFilters.slice(1);
      }
      return leftFilters.concat(rightFilters);
    } else {
      // `node` is a left-only AST
      return leftFilters;
    }
  }
}

export function getEnumFilterTerms(node: lucene.AST): string[] | null {
  if (
    !("field" in node.left) ||
    node.left.field !== "<implicit>" ||
    !("term" in node.left) ||
    ("boost" in node.left && node.left.boost !== null) ||
    ("prefix" in node.left && node.left.prefix !== null) ||
    ("regex" in node.left && node.left.regex !== false) ||
    ("similarity" in node.left && node.left.similarity !== null)
  ) {
    // Unsupported filter feature -> give up
    return null;
  }
  const leftTerm = node.left.term;
  if ("right" in node) {
    // `node` is a binary AST
    if (node.operator !== "OR") {
      // Unsupported operator -> give up
      return null;
    }
    if ("left" in node.right) {
      // `node.right` is an AST
      const rightTerms = getEnumFilterTerms(node.right);
      if (rightTerms === null) {
        // Right side couldn't be parsed -> give up
        return null;
      }
      return [leftTerm, ...rightTerms];
    } else {
      // `node.right` is a single node
      if ("term_min" in node.right) {
        // `node.right` is ranged, unsupported -> give up
        return null;
      }
      const rightTerm = node.right.term;
      return [leftTerm, rightTerm];
    }
  } else {
    return [leftTerm];
  }
}
