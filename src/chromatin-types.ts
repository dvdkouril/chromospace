import type { Table } from "apache-arrow";
import type { vec3 } from "gl-matrix";

/**
 * ChromatinStructure represents chromatin polymer data.
 * At the very least the `data` (Table) should have x, y, z columns (this represents what we originally called a chunk).
 * Additional columns are needed for filtering, such as selecting by chromosome or genomic coordinates.
 */
export type ChromatinStructure = {
  data: Table;

  /* Metadata */
  name?: string;
  /* Identifying organism and genome assembly */
  assembly?: string;
};

/**
 * ChromatinScene carries the structures to show
 */
export type ChromatinScene = {
  structures: DisplayableStructure[];
};

export type DisplayableStructure = {
  structure: ChromatinStructure;
  viewConfig: ViewConfig;
};

export type AssociatedValues = {
  values?: number[] | string[];
  field?: string; //~ used to specify the field in the Table that contains the values
  min?: number;
  max?: number;
};

export type AssociatedValuesColor = AssociatedValues & {
  /** Either a colorscale name (e.g., "viridis") or an array of categorical colors (e.g., ["#123456", "#abcdef", ...]) */
  colorScale: string | string[];
};

export type AssociatedValuesScale = AssociatedValues & {
  scaleMin: number;
  scaleMax: number;
};

export type ViewConfig = {
  scale?: number | AssociatedValuesScale;
  color?: string | AssociatedValuesColor;
  mark?: MarkTypes;
  links?: boolean;
  position?: vec3;
};

export type MarkTypes = "sphere" | "box" | "octahedron";

export type TrackViewConfig = {
  mark: MarkTypes;
  links: boolean;
  color?: string;
};
