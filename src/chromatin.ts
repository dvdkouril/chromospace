import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import { vec3 } from "gl-matrix";
import type {
  ChromatinScene,
  ChromatinStructure,
  DisplayableStructure,
  ViewConfig,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type { DrawableMarkSegment } from "./renderer/renderer-types";
import { valMap } from "./utils";

/**
 * Simple initializer for the ChromatinScene structure.
 */
export function initScene(): ChromatinScene {
  return {
    structures: [],
  };
}

export function addStructureToScene(
  scene: ChromatinScene,
  structure: ChromatinStructure,
  viewConfig?: ViewConfig,
): ChromatinScene {
  //~ TODO: reconsider: is this the right place and way to default the viewConfig?
  if (viewConfig === undefined) {
    viewConfig = {
      scale: 0.0001,
      color: undefined,
    };
  }

  const newDisplayableChunk: DisplayableStructure = {
    structure: structure,
    viewConfig: viewConfig,
  };
  scene = {
    ...scene,
    structures: [...scene.structures, newDisplayableChunk],
  };
  return scene;
}

/**
 * Parameters for the display function
 */
export type DisplayOptions = {
  alwaysRedraw?: boolean;
  withHUD?: boolean;
  hoverEffect?: boolean;
};

/**
 * Starts rendering of a scene. Returns a renderer object and a canvas.
 */
export function display(
  scene: ChromatinScene,
  options: DisplayOptions,
  targetCanvas?: HTMLCanvasElement,
): [ChromatinBasicRenderer, HTMLElement | HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer({
    alwaysRedraw: options.alwaysRedraw,
    hoverEffect: options.hoverEffect,
    canvas: targetCanvas,
  });
  buildStructures(scene.structures, renderer);
  renderer.startDrawing();
  const canvas = renderer.getCanvasElement();

  let elementToReturn: HTMLElement | HTMLCanvasElement = canvas;
  if (options.withHUD) {
    //~ create debug info layer
    const debugInfo = document.createElement("div");
    debugInfo.innerText = "";
    debugInfo.style.position = "absolute";
    debugInfo.style.top = "10px";
    debugInfo.style.left = "10px";
    debugInfo.style.fontFamily = "'Courier New', monospace";

    const updateHUDText = (text: string) => {
      debugInfo.innerText = text;
    };

    renderer.addUpdateHUDCallback(updateHUDText);

    //~ create contaienr
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";

    container.appendChild(debugInfo);
    container.appendChild(canvas);
    elementToReturn = container;
  }

  return [renderer, elementToReturn];
}

function buildStructures(
  structures: DisplayableStructure[],
  renderer: ChromatinBasicRenderer,
) {
  for (const s of structures) {
    buildDisplayableStructure(s, renderer);
  }
}

function resolveScale(
  vc: ViewConfig,
): number | number[] {

  const defaultScale = 0.005; //~ default scale
  let scale: number | number[] = defaultScale;

  if (!vc.scale) {
    return scale;
  }

  if (typeof vc.scale === "number") {
    //~ scale is a constant number for all bins
    scale = vc.scale;
  } else {
    //~ scale is an array of numbers
    const values = vc.scale.values;
    if (values.every((d) => typeof d === "number")) {
      //~ quantitative size scale
      const min = vc.scale.min;
      const max = vc.scale.max;
      const scaleMin = vc.scale.scaleMin || 0.001; // TODO: define default somewhere more explicit
      const scaleMax = vc.scale.scaleMax || 0.05; // TODO: define default somewhere more explicit
      scale = values.map((v) => valMap(v, min, max, scaleMin, scaleMax));
    } else {
      //~ string[] => nominal size scale
      // TODO:
      console.warn("TODO: not implemented (nominal size scale for chunk)");
    }
  }
  return scale;
}


function resolveColor(
  vc: ViewConfig,
): ChromaColor | ChromaColor[] {

  const defaultColor = chroma("red"); //~ default color is red
  let color: ChromaColor | ChromaColor[] = defaultColor; //~ default color is red

  if (!vc.color) {
    return color; //~ return default color
  }

  if (typeof vc.color === "string") {
    color = chroma(vc.color);
  } else {
    const values = vc.color.values;
    if (values.every((d) => typeof d === "number")) {
      const min = vc.color.min;
      const max = vc.color.max;

      //~ DK: For some reason, typescript complains if you don't narrow the type, even though the call is exactly the same.
      //~ This doesn't work: `const colorScale = chroma.scale(vc.color.colorScale)`
      const colorScale =
        typeof vc.color.colorScale === "string"
          ? chroma.scale(vc.color.colorScale)
          : chroma.scale(vc.color.colorScale);
      color = values.map((v) => colorScale.domain([min, max])(v));
    } else {
      //~ values: string[] => nominal color scale
      console.warn("TODO: not implemented (nominal color scale for chunk)");

      const mapColorsValues = new Map<string, ChromaColor>();
      color = [];
      for (const val of values) {
        if (mapColorsValues.has(val)) {
          const usedColor = mapColorsValues.get(val)!; //~ I know I should get something because I just checked...
          color.push(usedColor);
        } else {
          const newColor = chroma.random(); //~ TODO: use an actual color scale, not random
          mapColorsValues.set(val, newColor);
          color.push(newColor);
        }
      }
    }
  }
  return color;
}

function buildDisplayableStructure(
  structure: DisplayableStructure,
  renderer: ChromatinBasicRenderer,
) {

  const vc = structure.viewConfig;

  //1. assemble the xyz into vec3s
  const xArr = structure.structure.data.getChild("x")!.toArray();
  const yArr = structure.structure.data.getChild("y")!.toArray();
  const zArr = structure.structure.data.getChild("z")!.toArray();

  const positions: vec3[] = [];
  for (let i = 0; i < structure.structure.data.numRows; i++) {
    positions.push(vec3.fromValues(xArr[i], yArr[i], zArr[i]));
  }

  //2. calculate the visual attributes based on the viewConfig
  const color = resolveColor(vc);
  const scale = resolveScale(vc);

  const segment: DrawableMarkSegment = {
    mark: vc.mark || "sphere",
    positions: positions,
    attributes: {
      color: color,
      size: scale,
      makeLinks: vc.links ?? false,
      position: vc.position ?? vec3.fromValues(0, 0, 0),
    },
  };
  renderer.addSegments([segment]);
}
