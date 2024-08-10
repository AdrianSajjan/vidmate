import { isUndefined } from "lodash";
import { makeAutoObservable } from "mobx";

import { FabricUtils } from "@/fabric/utils";
import { createMap } from "@/lib/utils";
import { Editor } from "@/store/editor";

import { inter } from "@/constants/fonts";
import { mock } from "@/constants/mock";

import { EditorAudioElement } from "@/types/editor";
import { PromptSession } from "@/types/prompt";

export class Prompt {
  private _editor: Editor;

  modal: boolean;
  sessions: Map<string, PromptSession>;

  constructor(editor: Editor) {
    this._editor = editor;
    this.modal = false;
    this.sessions = createMap<string, PromptSession>(mock.state.prompts.map((session) => [session.id, session]));
    makeAutoObservable(this);
  }

  private get canvas() {
    return this._editor.canvas!;
  }

  private _dimensionsFromFormat(format: string) {
    switch (format) {
      default:
        return { height: 1080, width: 1920 };
    }
  }

  get hasSessions() {
    return Array.from(this.sessions.values()).length > 0;
  }

  toggleModal(state?: boolean) {
    if (isUndefined(state)) this.modal = !this.modal;
    else this.modal = state;
  }

  *createSceneFromPromptSession(session: PromptSession) {
    try {
      let offset = 0;

      const dimensions = this._dimensionsFromFormat(session.format);
      this.sessions.set(session.id, session);

      this.canvas.instance.clear();
      this.canvas.instance.insertAt(this.canvas.artboard, 0, false);
      this.canvas.instance.clipPath = this.canvas.artboard;
      this.canvas.workspace.changeFill("#FFFFFF");
      this.canvas.workspace.resizeArtboard(dimensions);

      this.canvas.timeline.set("seek", 0);
      this.canvas.timeline.set("duration", session.duration);

      for (const scene of session.scene) {
        if (scene.video) {
          const video: fabric.Video = yield this.canvas.onAddVideoFromSource(scene.video.url, { meta: { duration: scene.duration * 1000, offset } }, true, false);
          const scaleX = this.canvas.artboard.width! / video.width!;
          const scaleY = this.canvas.artboard.height! / video.height!;
          video.scale(Math.max(scaleX, scaleY));
          video.setPositionByOrigin(this.canvas.artboard.getCenterPoint(), "center", "center");
        }

        if (scene.speech) {
          const speech: EditorAudioElement = yield this.canvas.audio.add(scene.speech.url, FabricUtils.elementID(scene.speech.voice));
          this.canvas.audio.update(speech.id, { timeline: Math.min(speech.duration, scene.duration), offset: offset / 1000 });
          if (scene.speech.subtitle) {
            const text = this.canvas.onAddText(scene.speech.subtitle, inter, 42, 700);
            text.meta!.duration = Math.min(speech.duration * 1000, scene.duration * 1000);
            text.meta!.offset = offset;
            text.anim!.in.name = "typewriter";
            text.anim!.in.easing = "linear";
            text.anim!.in.text = "word";
            text.anim!.in.duration = Math.min(speech.duration * 1000, scene.duration * 1000);
            this.canvas.alignment.alignToPage(text, "center");
            text.set({ top: this.canvas.artboard.getScaledHeight() - text.getScaledHeight() * 2 });
          }
        }

        if (scene.audio) {
          const audio: EditorAudioElement = yield this.canvas.audio.add(scene.audio.url, scene.audio.name);
          this.canvas.audio.update(audio.id, { timeline: Math.min(audio.duration, scene.duration), offset: scene.duration === session.duration ? 0 : offset / 1000, volume: 0.1 });
        }

        offset = offset + scene.duration * 1000;
      }

      this.canvas.instance.renderAll();
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }
}
