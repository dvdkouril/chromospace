import type { Color as ChromaColor } from "chroma-js";
import type { vec3 } from "gl-matrix";

/**
 * Represents a sequential segment of chromatin bins (even if the connection links are not rendered) modeling a certain region of the genome.
 * The "drawable" part means that this object contains all information needed to actually draw the bins as 3D objects: besides the mark shape, also which color to draw the mark, which size, etc.
 */
export type DrawableMarkSegment = {
  mark: "sphere" | "box" | "octahedron"; //~ TODO: add others based on what's available in three
  positions: vec3[];
  attributes: VisualAttributes;
};

/**
 * Specifies the appearence of a chromatin segment:
 * - the shape of the mark,
 * - its position,
 * - what color is the mark drawn in, in which size,
 * - whether or not to draw links between the neighboring bins.
 */
export type VisualAttributes = {
  color: ChromaColor | ChromaColor[];
  size: number | number[];
  makeLinks: boolean;
};
