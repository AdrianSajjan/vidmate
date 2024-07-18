import anime from "animejs";

export abstract class CanvasAnimations {
  static initializeAnimations(canvas: fabric.Canvas | fabric.StaticCanvas, timeline: anime.AnimeTimelineInstance, duration: number) {
    timeline.add({ targets: canvas, duration: duration });

    for (const object of canvas._objects) {
      if (object.excludeFromTimeline) continue;

      object.anim!.state = { opacity: object.opacity, left: object.left, top: object.top, scaleX: object.scaleX, scaleY: object.scaleY, fill: object.fill, selectable: object.selectable };
      object.set({ selectable: false });

      const entry = object.anim!.in;
      const exit = object.anim!.out;

      switch (entry.name) {
        case "fade-in": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "slide-in-left": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              left: [object.left! - Math.min(object.getScaledWidth() / 2, 100), object.left!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "slide-in-right": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              left: [object.left! + Math.min(object.getScaledWidth() / 2, 100), object.left!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "rise-in-up": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! + Math.min(object.getScaledHeight() / 2, 50), object.top!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "rise-in-down": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! - Math.min(object.getScaledHeight() / 2, 50), object.top!],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
        case "pop-in": {
          timeline.add(
            {
              targets: object,
              opacity: [0, 1],
              top: [object.top! + object.getScaledHeight() / 4, object.top!],
              left: [object.left! + object.getScaledWidth() / 4, object.left!],
              scaleX: [object.scaleX! - 0.5, object.scaleX!],
              scaleY: [object.scaleY! - 0.5, object.scaleY],
              duration: entry.duration,
              easing: entry.easing || "linear",
              round: false,
            },
            object.meta!.offset,
          );
          break;
        }
      }

      switch (exit.name) {
        case "fade-out": {
          timeline.add(
            {
              targets: object,
              opacity: 0,
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "slide-out-left": {
          timeline.add(
            {
              targets: object,
              opacity: 0,
              left: [object.left!, object.left! - Math.min(object.getScaledWidth() / 2, 100)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "slide-out-right": {
          timeline.add(
            {
              targets: object,
              opacity: 0,
              left: [object.left!, object.left! + Math.min(object.getScaledWidth() / 2, 100)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "rise-out-up": {
          timeline.add(
            {
              targets: object,
              opacity: 0,
              top: [object.top!, object.top! - Math.min(object.getScaledHeight() / 2, 50)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
        case "sink-out-down": {
          timeline.add(
            {
              targets: object,
              opacity: 0,
              top: [object.top!, object.top! + Math.min(object.getScaledHeight() / 2, 50)],
              duration: exit.duration,
              easing: exit.easing || "linear",
              round: false,
            },
            object.meta!.offset + object.meta!.duration - exit.duration,
          );
          break;
        }
      }
    }
  }
}
