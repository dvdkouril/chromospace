import { ChromatinScene, ChromatinChunk, ChromatinPart, ChromatinModel, ChromatinSceneConfig } from "./chromatin-types";
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer";

/**
 * Utility function to add a chunk to scene
 */
export function addChunkToScene(
  scene: ChromatinScene,
  chunk: ChromatinChunk,
): ChromatinScene {
  scene = {
    ...scene,
    chunks: [...scene.chunks, chunk],
  };
  return scene;
}

/**
 * Utility function to add a model to scene
 */
export function addModelToScene(scene: ChromatinScene, model: ChromatinModel) {
  scene = {
    ...scene,
    models: [...scene.models, model],
  };
  return scene;
}

/**
 * Query for bin positions on specified genomic coordinates
 * @param coordinates
 * @returns chromatin part, i.e., list of bin positions corresponding to the genomic coordinates
 */
export function getRange(
  model: ChromatinModel,
  coordinates: string,
): ChromatinPart | null {
  console.log(`getRange with ${model} and ${coordinates}`);

  /*
   * This is probably useful for what queries users might be interested in making: https://genome.ucsc.edu/goldenPath/help/query.html
   */

  const toks = coordinates.split(":");
  const chr = toks[0];
  const coords = toks[1];

  let newPart: ChromatinPart | null = null;
  for (let part of model.parts) {
    //~ first finding the specified chromosome
    if (chr == part.label) {
      const start = parseInt(coords.split("-")[0]);
      const end = parseInt(coords.split("-")[1]);

      // const availableCoordinates = part.coordinates;
      /*
       *
       */
      const binIndexStart = (start - part.coordinates.start) / part.resolution;
      const binIndexEnd = (end - part.coordinates.start) / part.resolution;

      //TODO: boundary checks and clipping indices to available ranges

      newPart = {
        chunk: {
          bins: part.chunk.bins.slice(binIndexStart, binIndexEnd),
          rawBins: part.chunk.rawBins.slice(binIndexStart, binIndexEnd),
          id: -1,
        },
        coordinates: {
          start: start, //TODO: adjust for any range clipping
          end: end, //TODO: adjust for any range clipping
        },
        resolution: part.resolution,
      };
    }
  }

  // return null;
  return newPart;
}

/*
 * Fetched a bin range from model.
 * - absolute for the whole model: bins of each part are concatenated based on order of parts
 */
export function getBinsFromModel(
  model: ChromatinModel,
  start: number,
  end: number,
): ChromatinModel | null {
  /*
   * I actually have a choice here:
   * 1) just make the selection into a big "anonymous" part, without any separation of different parts
   * 2) maintain the separation into parts and essentially just return a new model
   *
   * now that I think about it, only 2) really makes sense: I can't concatenate two parts because that would create a connection.
   */

  let newModel: ChromatinModel = {
    ...model,
    parts: [],
  };
  // let newPart: ChromatinPart | null = null;
  let currentOffset = 0;
  for (let p of model.parts) {
    const startIndex = start - currentOffset;
    const endIndex = Math.min(p.chunk.bins.length, end - currentOffset);
    currentOffset = endIndex;
    const newPart = {
      chunk: {
        ...p.chunk, //TODO: probably I'll want a different id...
        bins: p.chunk.bins.slice(startIndex, endIndex),
        rawBins: p.chunk.rawBins.slice(startIndex, endIndex),
      },
      coordinates: p.coordinates, //TODO: needs actually converting
      resolution: p.resolution,
    };
    newModel.parts.push(newPart);
  }

  return newModel;
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

/*
 * Utility function for converting genomic coordinate (i.e., nucleobase position) to bin index, given certain resolution
 * --------
 * Example:
 * resolution: 10bp
 * positions: 0123456789...         *
 * sequence:  TCTGCGGAGCACTCTGGTAATGCATATGGTCCACAGGACATTCGTCGCTT
 * bins:      ____0_____----1-----||||2|||||xxxx3xxxxx****4*****
 * coordinateToBin(22, 10) -> 2
 */
export function coordinateToBin(
  coordinate: number,
  resolution: number,
  sequenceOffset?: number,
): number {
  if (!sequenceOffset) {
    sequenceOffset = 0;
  }
  return Math.floor((coordinate - sequenceOffset) / resolution);
}

// function binToCoordinateStart(): number {
//     return 0;
// }

export function display(scene: ChromatinScene, config?: ChromatinSceneConfig): [ChromatinBasicRenderer, HTMLCanvasElement] {
  const renderer = new ChromatinBasicRenderer();
  renderer.addScene(scene, config);
  renderer.startDrawing();
  const canvas = renderer.getCanvasElement();
  return [renderer, canvas];
}
