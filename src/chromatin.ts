import chroma from "chroma-js";
import type { Color as ChromaColor } from "chroma-js";
import type {
  ChromatinChunk,
  ChromatinModel,
  ViewConfig,
  ChromatinScene,
  DisplayableChunk,
  DisplayableModel,
  AssociatedValues,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import type {
  DrawableMarkSegment,
} from "./renderer/renderer-types";
import {
  customCubeHelix,
  decideVisualParameters,
  defaultColorScale,
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
      binSizeScale: 0.0001,
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
      binSizeScale: 0.0001,
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
      mark: model.viewConfig.mark || "sphere",
      positions: part.chunk.bins,
      attributes: {
        color: singleColor,
        colorMap: colorScale,
        size: size,
        makeLinks: model.viewConfig.makeLinks,
      },
      associatedValues: undefined,
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

  const vc = chunk.viewConfig;

  let scale: number | number[] = 1.0; //~ default scale
  if (typeof vc.binSizeScale === "number") {
    scale = vc.binSizeScale || 1.0;
  } else {
    if (vc.binSizeScale !== undefined) {
      const min = vc.binSizeScale.min;
      const max = vc.binSizeScale.max;
      scale = vc.binSizeScale.values.map(v => valMap(v, min, max, 0.001, 0.05)); 
  //   scalingFactor = valMap(binAssocValue, 0, 100, 1, 5);
    }
  }

  let color: ChromaColor | ChromaColor[] = chroma("red"); //~ default color is red
  if (vc.color !== undefined) {
    if (typeof vc.color === "string") {
      color = chroma(vc.color);
    } else {
      vc.color.values; //TODO: turn these values into a list of colors
      const min = vc.color.min;
      const max = vc.color.max;
      const colorScale = chroma.scale(vc.color.colorScale);
      color = vc.color.values.map(v => colorScale.domain([min, max])(v));

  // const scaledColorMap = colorMap.domain([minValue, maxValue]);
  // return scaledColorMap(binAssocValue);
  //       const binAssocValue = associatedValues.values[i];
  //       const minValue = 0;
  //       const maxValue = 100;
  //       const binColor = fetchColorFromScale(
  //         binAssocValue,
  //         minValue,
  //         maxValue,
  //         colorMap,
  //       );
    }
  }

  const segment: DrawableMarkSegment = {
    mark: chunk.viewConfig.mark || "sphere",
    positions: chunk.structure.bins,
    attributes: {
      color: color,
      size: scale,
      makeLinks: chunk.viewConfig.makeLinks || false,
    },
  };
  renderer.addSegments([segment]);

  /* ----------------------- */
  // if (chunk.viewConfig.coloring === "constant") {
  //   //~ A) setting a constant color for whole chunk
  //   const randColor = customCubeHelix.scale().colors(256, null)[
  //     Math.floor(Math.random() * 255)
  //   ];
  //   let color = randColor;
  //   if (chunk.viewConfig.color) {
  //     //~ override color if supplied
  //     color = chroma(chunk.viewConfig.color);
  //   }
  //   // this.buildPart(chunk.structure, { color: color });
  //
  //   const segment: DrawableMarkSegment = {
  //     mark: chunk.viewConfig.mark || "sphere",
  //     positions: chunk.structure.bins,
  //     attributes: {
  //       color: color,
  //       colorMap: undefined,
  //       size: chunk.viewConfig.binSizeScale || 0.1,
  //       makeLinks: chunk.viewConfig.makeLinks,
  //     },
  //     associatedValues: undefined,
  //   };
  //   renderer.addSegments([segment]);
  // } else if (chunk.viewConfig.coloring === "scale") {
  //   //~ B) using a color scale with the bin index as lookup
  //   let assocValues: Associated1DData | undefined = undefined;
  //   if (chunk.viewConfig.associatedValues !== undefined) {
  //     assocValues = {
  //       values: chunk.viewConfig.associatedValues,
  //     };
  //   }
  //   const segment: DrawableMarkSegment = {
  //     mark: chunk.viewConfig.mark || "sphere",
  //     positions: chunk.structure.bins,
  //     attributes: {
  //       color: undefined,
  //       colorMap: defaultColorScale,
  //       size: chunk.viewConfig.binSizeScale || 0.1,
  //       makeLinks: chunk.viewConfig.makeLinks,
  //     },
  //     associatedValues: assocValues,
  //   };
  //   renderer.addSegments([segment]);
  // }
}
