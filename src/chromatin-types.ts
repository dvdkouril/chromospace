import { vec3 } from "gl-matrix";

export type GenomicCoordinates = {
  chromosome: string;
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
  assembly: string;
};

export type ChromatinScene = {
  chunks: ChromatinChunk[];
  models: ChromatinModel[];

  displayables: ChromatinModelDisplayable[];

  config: {
    layout: "center" | "grid";
  };
};

/**
 * TODO: come up with a better name, this is kinda stupid.
 * What this structure should represent is a visual instantiation of a ChromatinModel, with different attributes influencing its visual presentation
 */
// export type ChromatinModelInstance = {
export type ChromatinModelDisplayable = {
  /* The 3D structure, just the raw data, nothing about the visual appearance */
  structure: ChromatinModel;
  // signal: ChromatinMappableSignal; //~ placeholder: in the "displayable" it probably makes sense to have the data by which you'll visually modify the 3D structure

  viewConfig: ChromatinModelViewConfig; //~ viewConfig then specifies how the `signal` is mapped to visual attributes of the structure
};

export type ChromatinModelViewConfig = {
  binSizeScale?: number; //~ we estimate good starting bin sphere radius; this allows to change it
  coloring?: "constant" | "scale";
  selections: Selection[];
};

/**
 * Two scenarios in mind:
 *  1. continuous selection along the genomic sequence
 *    - in this case, the regions array will just a single selected region
 *  2. selection in 3D (i.e., resulting in many disconnected regions)
 */
export type Selection = {
  regions: GenomicCoordinates[];
  color: string;
  label: string;
};

/**
 * The idea is that when rendering, you get both the model and a selection:
 * render(model, selection);
 * and then when building that part for rendering, you just look at selection
 * and see if it's undefined (=you draw everything) or an actual selection
 */
