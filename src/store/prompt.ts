import { createMap } from "@/lib/utils";
import { Editor } from "@/store/editor";
import { PromptSession } from "@/types/prompt";
import { isUndefined } from "lodash";

export class Prompt {
  private _editor: Editor;

  modal: boolean;
  sessions: Map<string, PromptSession>;

  constructor(editor: Editor) {
    this._editor = editor;
    this.modal = false;
    this.sessions = createMap<string, PromptSession>();
  }

  toggleModal(state?: boolean) {
    if (isUndefined(state)) this.modal = !this.modal;
    else this.modal = state;
  }

  createSceneFromPromptSession(session: PromptSession) {
    this.sessions.set(session.id, session);
  }
}
