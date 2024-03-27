import { vec3 } from "gl-matrix";

export type GenomicCoordinates = {
  start: number;
  end: number;
};

/**
 * A simple list of bin positions.
 * Used in two scenarios:
 *  a) an "anonymous" chunk of chromatin data, and
 *  b) properly annotated part of a larger model (e.g., in whole-genome model, chromosomes will be different chunks).
 */
export type ChromatinChunk = {
  /**
   * bin positions that are actually visualized
   */
  bins: vec3[];
  /**
   * bin positions before any processing (recenter, normalize)
   */
  rawBins: vec3[];

  id: number;
};

/**
 * Adds information identifying the 3D part on genomic sequence
 */
export type ChromatinPart = {
  chunk: ChromatinChunk;

  coordinates: GenomicCoordinates;
  resolution: number;

  label?: string;
};

/**
 * A full model that contains annotation about which genomic regions the individual parts correspond to
 */
export type ChromatinModel = {
  parts: ChromatinPart[];
  position: { x: number; y: number; z: number };
};

export type ChromatinScene = {
  chunks: ChromatinChunk[];
  models: ChromatinModel[];

  config: {
    layout: "center" | "grid";
  };
};
export type ChromatinSceneConfig = {
  binSizeScale?: number; //~ we estimate good starting bin sphere radius; this allows to change it
};
