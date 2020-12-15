import { Base } from "./base";

enum Types {
  text,
  select
}

export class Field extends Base {
  type: Types;
  validation: Object;
  value: string;
  name: string;
  label: string;
  fieldId: string;
}
