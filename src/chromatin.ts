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
import type { Scene } from "three";

export let viewportCounter = 0;
const renderer = new ChromatinBasicRenderer({
  // alwaysRedraw: options.alwaysRedraw,
  // hoverEffect: options.hoverEffect,
  alwaysRedraw: true,
  hoverEffect: false,
});

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
  console.log(options); //~ just to shut of the lsp
  console.log("DISPLAY___________________!");

  const canvas = renderer.getCanvasElement();
  canvas.style.pointerEvents = "none";

  const elementToReturn = decideElementToReturn(viewportCounter, canvas);
  const threeScene = renderer.initNewScene(elementToReturn);
  //~ store the dummy element (in wrapper) in the scene's userData (so that we can grab its rect during rendering)
  buildStructures(scene.structures, renderer, threeScene);
  renderer.startDrawing();

  console.log(`viewportCounter = ${viewportCounter}`);
  viewportCounter += 1;

  return [renderer, elementToReturn];
}

function decideElementToReturn(
  counter: number,
  canvas: HTMLCanvasElement,
): HTMLElement {
  const dummyDiv = document.createElement("div");
  const wrapperDiv = document.createElement("div");
  //~ dummy div element should be defined by the size of its parent
  dummyDiv.style.width = "100%";
  dummyDiv.style.height = "100%";
  dummyDiv.style.backgroundColor = "purple"; //~ debug
  wrapperDiv.appendChild(dummyDiv);
  if (counter < 1) {
    wrapperDiv.appendChild(canvas);
    console.log("returning CANVAS, too.");
  } else {
    console.log("returning only dummy DIV.");
  }
  return wrapperDiv;
}

function buildStructures(
  structures: (DisplayableChunk | DisplayableModel)[],
  renderer: ChromatinBasicRenderer,
  scene: Scene,
) {
  for (const s of structures) {
    switch (s.kind) {
      case "model":
        buildDisplayableModel(s, renderer, scene);
        break;
      case "chunk":
        buildDisplayableChunk(s, renderer, scene);
        break;
    }
  }
}

function buildDisplayableModel(
  model: DisplayableModel,
  renderer: ChromatinBasicRenderer,
  scene: Scene,
) {
  const segments: DrawableMarkSegment[] = [];

  const n = model.structure.parts.length;
  const needColorsN = n;
  const defaultChunkColors = customCubeHelix.scale().colors(needColorsN, null);
  for (const [i, part] of model.structure.parts.entries()) {
    const vc = model.viewConfig;

    let scale: number | number[] = 0.01; //~ default scale
    if (typeof vc.scale === "number") {
      scale = vc.scale || 0.01;
    } else {
      if (vc.scale !== undefined) {
        const min = vc.scale.min;
        const max = vc.scale.max;
        const scaleMin = vc.scale.scaleMin || 0.0001;
        const scaleMax = vc.scale.scaleMax || 0.005;
        scale = vc.scale.values.map((v) =>
          valMap(v, min, max, scaleMin, scaleMax),
        );
      }
    }

    const defaultColor = defaultChunkColors[i];
    let color: ChromaColor | ChromaColor[] = defaultColor; //~ default color is red
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
      mark: model.viewConfig.mark || "sphere",
      positions: part.chunk.bins,
      attributes: {
        color: color,
        size: scale,
        makeLinks: model.viewConfig.links || false,
      },
    };
    segments.push(segment);
  }
  renderer.addSegments(segments, scene);
}

/*
 * Takes the data and viewConfig and makes specific DrawableSegments that the renderer can directly render (all visual attributes are decided)
 */
function buildDisplayableChunk(
  chunk: DisplayableChunk,
  renderer: ChromatinBasicRenderer,
  scene: Scene,
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
  renderer.addSegments([segment], scene);
}
