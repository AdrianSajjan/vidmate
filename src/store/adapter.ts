import { EditorProduct } from "@/types/adapter";
import { makeAutoObservable } from "mobx";

type AdapterMode = "create" | "edit";

interface AdapterProps {
  product?: EditorProduct;
  objective?: string;
  mode?: AdapterMode;
}

export class Adapter {
  mode?: AdapterMode;
  objective?: string;
  product?: EditorProduct;

  constructor() {
    makeAutoObservable(this);
  }

  initialize(props: AdapterProps) {
    this.mode = props.mode;
    this.product = props.product;
    this.objective = props.objective;
  }

  update(props: Partial<AdapterProps>) {
    for (const _key in props) {
      const key = _key as keyof AdapterProps;
      (this as any)[key] = props[key];
    }
  }
}
