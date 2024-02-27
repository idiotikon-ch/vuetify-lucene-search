export type PositiveOperator = "<implicit>" | "AND" | "OR";

export type FilterField =
  | {
      name: "<implicit>";
      displayName: string;
      type: "string";
      defaultValue: string;
    }
  | ({
      name: string;
      displayName: string;
    } & (
      | {
          type: "string";
          defaultValue: string;
        }
      | {
          type: "integer" | "float";
          defaultValue: number;
          constraints: {
            min: number;
            max: number;
          };
        }
      | {
          type: "integer-range" | "float-range";
          defaultValue: [number, number];
          constraints: {
            min: number;
            max: number;
          };
        }
      | {
          type: "boolean";
          defaultValue: boolean;
        }
      | {
          type: "enum";
          defaultValue: string[];
          autocomplete: boolean;
          constraints: {
            options: { [value: string]: string };
          };
        }
    ));

export interface Filter {
  field: FilterField;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
