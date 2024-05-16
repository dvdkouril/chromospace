import {
  ChromatinScene,
  ChromatinChunk,
  ChromatinPart,
  ChromatinModel,
  Selection,
  DisplayableChunk,
  DisplayableModel,
  ChromatinModelViewConfig,
  ChromatinChunkViewConfig,
  MarkTypes,
} from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";
import { DrawableMarkSegment } from "./renderer/renderer-types";
import { coordinateToBin, decideVisualParameters, defaultColorScale, customCubeHelix } from "./utils";
import chroma from "chroma-js";

// function initScene(): ChromatinScene;
// function initScene(chunk: ChromatinChunk): ChromatinScene;
// function initScene(model: ChromatinModel): ChromatinScene;
// function initScene(initStructure?: ChromatinModel | ChromatinChunk | ChromatinModelDisplayable): ChromatinScene {
//   let scene: ChromatinScene = {
//     models: [],
//     chunks: [],
//     displayables: [],
//     config: {
//       layout: "center",
//     },
//   };
//   if (initStructure instanceof ChromatinModel) {
//     scene = {
//       ...scene,
//       models: [...scene.models, model]
//     }
//   }
//
//   if (chunk != undefined) {
//     scene = {
//       ...scene,
//       chunks: [...scene.chunks, chunk]
//     }
//   }
//
//   if (displayable != undefined) {
//     scene = {
//       ...scene,
//       displayables: [...scene.displayables, displayable]
//     }
//   }
//   return scene;
// }
//
// const modelA: ChromatinModel = {
//   parts: [],
//   assembly: "",
// };
// const chunk: ChromatinChunk = {
//   bins: [],
//   rawBins: [],
//   id: 0,
// };
// // const displayableModel: ChromatinModelDisplayable = {};
// // const scene = initScene(modelA, modelB, chunk, displayableModel);
// const scene = initScene();
// const sceneB = initScene(modelA);
// const sceneC = initScene(chunk);
//
// console.log(scene);
// console.log(sceneB);
// console.log(sceneC);

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
  if (viewConfig == undefined) {
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
  }
  return scene;
}

/**
 * Utility function to add a model to scene
 */
export function addModelToScene(scene: ChromatinScene, model: ChromatinModel, viewConfig?: ChromatinModelViewConfig) {
  if (viewConfig == undefined) {
    viewConfig = {
      binSizeScale: 0.0001,
      coloring: "constant",
      selections: [],
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

function getChromosome(
  model: ChromatinModel,
  chrName: string,
): [ChromatinPart, Selection] | null {
  for (let part of model.parts) {
    if (part.label == chrName) {
      const selection: Selection = {
        regions: [
          {
            chromosome: chrName,
            start: part.coordinates.start,
            end: part.coordinates.end,
          }],
        color: "#FF00FF",
        label: chrName,
      };
      return [part, selection];
      //TODO: what if more parts modeling the same chromosome?
    }
  }
  return null; //~ not found...
}

function getChromosomeAtCoordinates(
  model: ChromatinModel,
  chrName: string,
  start: number,
  end: number,
): [ChromatinPart, Selection] | null {
  let newPart: ChromatinPart | null = null;
  let selection: Selection | null = null;
  for (let part of model.parts) {
    //~ first finding the specified chromosome
    if (chrName != part.label) {
      continue;
    }

    const binStartIndex = coordinateToBin(
      start,
      part.resolution,
      part.coordinates.start,
    );
    const binEndIndex = coordinateToBin(
      end,
      part.resolution,
      part.coordinates.start,
    );

    newPart = {
      chunk: {
        bins: part.chunk.bins.slice(binStartIndex, binEndIndex),
        rawBins: part.chunk.rawBins.slice(binStartIndex, binEndIndex),
        id: -1,
      },
      coordinates: {
        chromosome: chrName,
        start: start, //TODO: adjust for any range clipping
        end: end, //TODO: adjust for any range clipping
      },
      resolution: part.resolution,
    };

    selection = {
      regions: [
        {
          chromosome: chrName,
          start: newPart.coordinates.start,
          end: newPart.coordinates.end,
        }],
      color: "#FF00FF",
      label: "",
    };
  }

  if (!newPart || !selection) {
    return null;
  } else {
    return [newPart, selection];
  }
}

/**
 * Query for model parts on specified genomic coordinates
 * @param coordinates, e.g., "chr1" or "chr1:10000000-12000000" (chromosome annotation is linked to what's in ChromatinPart.label
 * @returns chromatin part, i.e., bins corresponding to the genomic coordinates
 */
export function get(
  model: ChromatinModel,
  coordinates: string,
): [ChromatinPart, Selection] | null {
  console.log(`getRange with ${model} and ${coordinates}`);

  //~ Possibly just a chromosome name (without any coordinates)
  //~ => return the whole part
  if (!coordinates.includes(":")) {
    const chromosomeName = coordinates.trim();
    return getChromosome(model, chromosomeName);
  }

  //~ Otherwise: there are coordinates to check too
  const toks = coordinates.split(":");
  const chr = toks[0];
  const coords = toks[1];
  const start = parseInt(coords.split("-")[0]);
  const end = parseInt(coords.split("-")[1]);

  return getChromosomeAtCoordinates(model, chr, start, end);
}

export function getRegionAsPart(model: ChromatinModel, coordinates: string): ChromatinPart | null {
  const result = get(model, coordinates);
  if (result) {
    const [part, _] = result;
    return part;
  } else {
    return null;
  }
}

export function getBinsFromPart(
  part: ChromatinPart,
  start: number,
  end: number,
): ChromatinPart | null {
  const clamp = (val: number, min: number, max: number) =>
    Math.max(Math.min(max, val), min);

  //~ range guards
  const n = part.chunk.bins.length;
  const startIndex = clamp(start, 0, n - 1);
  const endIndex = clamp(end, 0, n - 1);

  const newPart = {
    chunk: {
      ...part.chunk, //TODO: probably I'll want a different id...
      bins: part.chunk.bins.slice(startIndex, endIndex),
      rawBins: part.chunk.rawBins.slice(startIndex, endIndex),
    },
    coordinates: part.coordinates, //TODO: needs actually converting
    resolution: part.resolution,
  };
  return newPart;
}

function buildStructures(structures: (DisplayableChunk | DisplayableModel)[], renderer: ChromatinBasicRenderer) {
  for (let s of structures) {
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

function buildDisplayableModel(model: DisplayableModel, renderer: ChromatinBasicRenderer) {
  let segments: DrawableMarkSegment[] = [];
  for (let [i, part] of model.structure.parts.entries()) {
    const n = model.structure.parts.length;
    const [singleColor, colorScale, _] = decideVisualParameters(model.viewConfig, i, n);
    //~ this is a hack: should go inside (?) the decider func above
    const marks: MarkTypes[] = ["sphere", "box", "octahedron"];
    const segment: DrawableMarkSegment = {
      mark: marks[(i % 3)],
      positions: part.chunk.bins,
      attributes: {
        color: singleColor,
        colorMap: colorScale,
        // size: sphereSize,
        size: 0.01,
        makeLinks: false,
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
function buildDisplayableChunk(chunk: DisplayableChunk, renderer: ChromatinBasicRenderer) {
  if (chunk.viewConfig.coloring == "constant") {
    //~ A) setting a constant color for whole chunk
    const randColor = customCubeHelix.scale().colors(256, null)[Math.floor(Math.random() * 255)];
    let color = randColor;
    if (chunk.viewConfig.color) { //~ override color if supplied
      color = chroma(chunk.viewConfig.color);
    }
    // this.buildPart(chunk.structure, { color: color });

    const segment: DrawableMarkSegment = {
      mark: "sphere",
      positions: chunk.structure.bins,
      attributes: {
        color: color,
        colorMap: undefined,
        size: 1.0,
        makeLinks: true,
      },
    };
    renderer.addSegments([segment]);
  } else if (chunk.viewConfig.coloring == "scale") {
    //~ B) using a color scale with the bin index as lookup
    // this.buildPart(chunk.structure, { colorMap: defaultColorScale });
    const segment: DrawableMarkSegment = {
      mark: "sphere",
      positions: chunk.structure.bins,
      attributes: {
        color: undefined,
        colorMap: defaultColorScale,
        size: 1.0,
        makeLinks: true,
      },
    };
    renderer.addSegments([segment]);
  }
}

// type DrawableChromatinPart = {
//   structure: ChromatinChunk;
//   viewConfig: VisualChannels;
// };

export type DisplayOptions = {
  alwaysRedraw?: boolean;
};

export function display(
  scene: ChromatinScene, 
  options: DisplayOptions,
): [ChromatinBasicRenderer, HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer({ alwaysRedraw: options.alwaysRedraw });
  // renderer.addScene(scene);
  buildStructures(scene.structures, renderer);
  renderer.startDrawing();
  const canvas = renderer.getCanvasElement();
  return [renderer, canvas];
}
