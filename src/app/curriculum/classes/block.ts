import { Field } from "./field";
import { Base } from "./base";

export class Block  extends Base{
  order: number;
  name: string;
  description: string;
  fields: Field[];
  blockId: string;

  constructor(props) {
    super(props);
    this.fields = Array.isArray(props.fields) ? props.fields.map(this.processFields) : [];
  }

  processFields(field) {
    if(field instanceof Field) {
      return field;
    } else {
      return new Field(field);
    }
  }
}
