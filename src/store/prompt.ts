import { Editor } from "@/store/editor";
import { isUndefined } from "lodash";

export class Prompt {
  private _editor: Editor;

  modal: boolean;

  constructor(editor: Editor) {
    this._editor = editor;
    this.modal = false;
  }

  toggleModal(state?: boolean) {
    if (isUndefined(state)) this.modal = !this.modal;
    else this.modal = state;
  }
}
