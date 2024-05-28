import chroma from "chroma-js";
import type {
  ChromatinChunk,
  ChromatinChunkViewConfig,
  ChromatinModel,
  ChromatinModelViewConfig,
  ChromatinScene,
  DisplayableChunk,
  DisplayableModel,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type { DrawableMarkSegment } from "./renderer/renderer-types";
import {
  customCubeHelix,
  decideVisualParameters,
  defaultColorScale,
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
  viewConfig?: ChromatinChunkViewConfig,
): ChromatinScene {
  if (viewConfig === undefined) {
    viewConfig = {
      binSizeScale: 0.0001,
      coloring: "constant",
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
  viewConfig?: ChromatinModelViewConfig,
): ChromatinScene {
  if (viewConfig === undefined) {
    viewConfig = {
      binSizeScale: 0.0001,
      coloring: "constant",
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
};

/**
 * Starts rendering of a scene. Returns a renderer object and a canvas.
 */
export function display(
  scene: ChromatinScene,
  options: DisplayOptions,
): [ChromatinBasicRenderer, HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer({
    alwaysRedraw: options.alwaysRedraw,
  });
  buildStructures(scene.structures, renderer);
  renderer.startDrawing();
  const canvas = renderer.getCanvasElement();
  return [renderer, canvas];
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

function buildDisplayableModel(
  model: DisplayableModel,
  renderer: ChromatinBasicRenderer,
) {
  const segments: DrawableMarkSegment[] = [];
  for (const [i, part] of model.structure.parts.entries()) {
    const n = model.structure.parts.length;
    const [singleColor, colorScale, size] = decideVisualParameters(
      model.viewConfig,
      i,
      n,
    );
    const segment: DrawableMarkSegment = {
      // mark: "sphere",
      mark: model.viewConfig.mark || "sphere",
      positions: part.chunk.bins,
      attributes: {
        color: singleColor,
        colorMap: colorScale,
        size: size,
        makeLinks: model.viewConfig.makeLinks,
      },
    };
    segments.push(segment);
  }
  renderer.addSegments(segments);
}

/*
 * chunk options:
 * - custom color
 * - generate color for me
 * - custom scale
 * - default scale
 */
function buildDisplayableChunk(
  chunk: DisplayableChunk,
  renderer: ChromatinBasicRenderer,
) {
  if (chunk.viewConfig.coloring === "constant") {
    //~ A) setting a constant color for whole chunk
    const randColor = customCubeHelix.scale().colors(256, null)[
      Math.floor(Math.random() * 255)
    ];
    let color = randColor;
    if (chunk.viewConfig.color) {
      //~ override color if supplied
      color = chroma(chunk.viewConfig.color);
    }
    // this.buildPart(chunk.structure, { color: color });

    const segment: DrawableMarkSegment = {
      mark: "sphere",
      positions: chunk.structure.bins,
      attributes: {
        color: color,
        colorMap: undefined,
        size: chunk.viewConfig.binSizeScale || 0.1,
        makeLinks: true,
      },
    };
    renderer.addSegments([segment]);
  } else if (chunk.viewConfig.coloring === "scale") {
    //~ B) using a color scale with the bin index as lookup
    // this.buildPart(chunk.structure, { colorMap: defaultColorScale });
    const segment: DrawableMarkSegment = {
      mark: "sphere",
      positions: chunk.structure.bins,
      attributes: {
        color: undefined,
        colorMap: defaultColorScale,
        size: chunk.viewConfig.binSizeScale || 0.1,
        makeLinks: true,
      },
    };
    renderer.addSegments([segment]);
  }
}
