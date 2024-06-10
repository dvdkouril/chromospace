import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import type { vec3 } from "gl-matrix";

/**
 * Represents a sequential segment of chromatin bins (even if the connection links are not rendered) modeling a certain region of the genome.
 * The "drawable" part means that this object contains all information needed to actually draw the bins as 3D objects: besides the mark shape, also which color to draw the mark, which size, etc.
 */
export type DrawableMarkSegment = {
  mark: "sphere" | "box" | "octahedron"; //~ TODO: add others based on what's available in three
                                          //~ TODO: maybe this should rather go to VisualAttributes?
  positions: vec3[];
  attributes: VisualAttributes;
  associatedValues: Associated1DData | undefined;
};

/**
 * Specifies the appearence of a chromatin segment:
 * - the shape of the mark,
 * - its position,
 * - what color is the mark drawn in, in which size,
 * - whether or not to draw links between the neighboring bins.
 */
export type VisualAttributes = {
  color?: ChromaColor;
  colorMap?: ChromaScale;
  size: number;
  makeLinks?: boolean;
};

/**
 * The appearance of the segment marks might be determined based on some genomic track data.
 * The idea here is to store here already computed data processed to fit into the available bins.
 * I.e., the size of the `values` array will correspond to # of bins.
 * These values can then be mapped to visual properties, e.g., color or size.
 */
export type Associated1DData = {
  values: number[];
};
