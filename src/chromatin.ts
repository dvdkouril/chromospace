import chroma from "chroma-js";
import type { Color as ChromaColor } from "chroma-js";
import type {
  ChromatinChunk,
  ChromatinModel,
  ChromatinScene,
  DisplayableChunk,
  DisplayableModel,
  ViewConfig,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type { DrawableMarkSegment } from "./renderer/renderer-types";
import {
  customCubeHelix,
  // decideVisualParameters,
  // defaultColorScale,
  valMap,
} from "./utils";

/**
 * Simple initializer for the ChromatinScene structure.
 */
export function initScene(): ChromatinScene {
  return {
    structures: [],
    config: {
      layout: "center",
    },
  };
}

/**
 * Utility function to add a chunk to scene
 */
export function addChunkToScene(
  scene: ChromatinScene,
  chunk: ChromatinChunk,
  viewConfig?: ViewConfig,
): ChromatinScene {
  if (viewConfig === undefined) {
    viewConfig = {
      scale: 0.0001,
      color: undefined,
    };
  }

  const newDisplayableChunk: DisplayableChunk = {
    kind: "chunk",
    structure: chunk,
    viewConfig: viewConfig,
  };
  scene = {
    ...scene,
    structures: [...scene.structures, newDisplayableChunk],
  };
  return scene;
}

/**
 * Utility function to add a model to scene
 */
export function addModelToScene(
  scene: ChromatinScene,
  model: ChromatinModel,
  viewConfig?: ViewConfig,
): ChromatinScene {
  if (viewConfig === undefined) {
    viewConfig = {
      scale: 0.0001,
    };
  }

  const newDisplayableModel: DisplayableModel = {
    kind: "model",
    structure: model,
    viewConfig: viewConfig,
  };

  scene = {
    ...scene,
    structures: [...scene.structures, newDisplayableModel],
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
): [ChromatinBasicRenderer, HTMLElement | HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer({
    alwaysRedraw: options.alwaysRedraw,
    hoverEffect: options.hoverEffect,
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
  structures: (DisplayableChunk | DisplayableModel)[],
  renderer: ChromatinBasicRenderer,
) {
  for (const s of structures) {
    switch (s.kind) {
      case "model":
        buildDisplayableModel(s, renderer);
        break;
      case "chunk":
        buildDisplayableChunk(s, renderer);
        break;
    }
  }
}

function resolveScale(vc: ViewConfig, valuesOffset: number, valuesLength: number): number | number[] {
  let scale: number | number[] = 0.01; //~ default scale
  if (!vc.scale) {
    scale = 0.01;
  } else if (typeof vc.scale === "number") {
    scale = vc.scale;
  } else {
    //~ vc.scale is AssociatedValuesScale
    const values = vc.scale.values;
    if (values.length <= 0) {
      //~ nothing we can do about empty array of values
      return scale;
    }

    if (values.every(d => typeof d === 'number')) {
      //~ quantitative size scale
      const min = vc.scale.min;
      const max = vc.scale.max;
      const scaleMin = vc.scale.scaleMin || 0.0001;
      const scaleMax = vc.scale.scaleMax || 0.005;
      const valuesSubArr = values.slice(
        valuesOffset,
        valuesOffset + valuesLength,
      );
      scale = valuesSubArr.map((v) => valMap(v, min, max, scaleMin, scaleMax));
    } else {
      //~ string[] => nominal size scale
      console.warn("TODO: not implemented");
    }
  }
  return scale;
}

//function resolveColor() {
//}

function buildDisplayableModel(
  model: DisplayableModel,
  renderer: ChromatinBasicRenderer,
) {
  const segments: DrawableMarkSegment[] = [];

  const n = model.structure.parts.length;
  const needColorsN = n;
  const defaultChunkColors = customCubeHelix.scale().colors(needColorsN, null);
  const colorsMap = new Map<string, string>();
  let usedColors = 0;
  let valuesIndexOffset = 0;
  for (const [i, part] of model.structure.parts.entries()) {
    const vc = model.viewConfig;

    let scale = resolveScale(vc, valuesIndexOffset, part.chunk.bins.length);

    const defaultColor = defaultChunkColors[i];
    let color: ChromaColor | ChromaColor[] = defaultColor; //~ default color is red
    if (vc.color !== undefined) {
      if (typeof vc.color === "string") {
        color = chroma(vc.color);
      } else {
        const values = vc.color.values;
        if (values.length <= 0) {
          //~ nothing we can do with an empty array...
          return;
        }


        //console.log("gonna sliceeee");
        const valuesSubArr = vc.color.values.slice(
          valuesIndexOffset,
          valuesIndexOffset + part.chunk.bins.length,
        );

        if (typeof values[0] === "number") {
          //~ quantitative color scale
          const min = vc.color.min;
          const max = vc.color.max;
          const colorScale = chroma.scale(vc.color.colorScale);
          color = valuesSubArr.map((v) => colorScale.domain([min, max])(v));
        } else {
          //~ string[] => nominal color scale
          //console.log("stringggggggssssss");
          const colors = vc.color.colorScale as string[];
          //console.log("valuesSubArr", valuesSubArr);
          color = valuesSubArr.map(v => {
            if (colorsMap.has(v)) {
              return chroma(colorsMap.get(v));
            } else {
              colorsMap.set(v, colors[usedColors]);
              usedColors += 1;
              return chroma(colorsMap.get(v));
            }
          });
          //console.log(color);
        }
      }
    }

    const segment: DrawableMarkSegment = {
      mark: model.viewConfig.mark || "sphere",
      positions: part.chunk.bins,
      attributes: {
        color: color,
        size: scale,
        makeLinks: model.viewConfig.links || false,
      },
    };
    segments.push(segment);
    valuesIndexOffset += part.chunk.bins.length;
  }
  renderer.addSegments(segments);
}

/*
 * Takes the data and viewConfig and makes specific DrawableSegments that the renderer can directly render (all visual attributes are decided)
 */
function buildDisplayableChunk(
  chunk: DisplayableChunk,
  renderer: ChromatinBasicRenderer,
) {
  const vc = chunk.viewConfig;

  let scale: number | number[] = 0.01; //~ default scale
  if (typeof vc.scale === "number") {
    scale = vc.scale || 0.01;
  } else {
    if (vc.scale !== undefined) {
      const min = vc.scale.min;
      const max = vc.scale.max;
      const scaleMin = vc.scale.scaleMin || 0.001;
      const scaleMax = vc.scale.scaleMax || 0.05;
      scale = vc.scale.values.map((v) =>
        valMap(v, min, max, scaleMin, scaleMax),
      );
    }
  }

  let color: ChromaColor | ChromaColor[] = chroma("red"); //~ default color is red
  if (vc.color !== undefined) {
    if (typeof vc.color === "string") {
      color = chroma(vc.color);
    } else {
      const min = vc.color.min;
      const max = vc.color.max;
      const colorScale = chroma.scale(vc.color.colorScale);
      color = vc.color.values.map((v) => colorScale.domain([min, max])(v));
    }
  }

  const segment: DrawableMarkSegment = {
    mark: chunk.viewConfig.mark || "sphere",
    positions: chunk.structure.bins,
    attributes: {
      color: color,
      size: scale,
      makeLinks: chunk.viewConfig.links || false,
    },
  };
  renderer.addSegments([segment]);
}
