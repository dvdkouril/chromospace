import type { Color as ChromaColor, Scale as ChromaScale } from "chroma-js";
import type { vec3 } from "gl-matrix";

export type DrawableMarkSegment = {
  mark: "sphere" | "box" | "octahedron"; //~ TODO: add others based on what's available in three
  positions: vec3[];
  attributes: VisualAttributes;
};

export type VisualAttributes = {
  color?: ChromaColor;
  colorMap?: ChromaScale,
  size: number;
  makeLinks: boolean,
};
