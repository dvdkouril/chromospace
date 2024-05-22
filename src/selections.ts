import type {
  ChromatinModel,
  ChromatinPart,
  Selection,
} from "./chromatin-types";
import { coordinateToBin } from "./utils";

function getChromosome(
  model: ChromatinModel,
  chrName: string,
): [ChromatinPart, Selection] | null {
  for (const part of model.parts) {
    if (part.label === chrName) {
      const selection: Selection = {
        regions: [
          {
            chromosome: chrName,
            start: part.coordinates.start,
            end: part.coordinates.end,
          },
        ],
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
  for (const part of model.parts) {
    //~ first finding the specified chromosome
    if (chrName !== part.label) {
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
        },
      ],
      color: "#FF00FF",
      label: "",
    };
  }

  if (!newPart || !selection) {
    return null;
  }
  return [newPart, selection];
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
  const start = Number.parseInt(coords.split("-")[0]);
  const end = Number.parseInt(coords.split("-")[1]);

  return getChromosomeAtCoordinates(model, chr, start, end);
}

export function getRegionAsPart(
  model: ChromatinModel,
  coordinates: string,
): ChromatinPart | null {
  const result = get(model, coordinates);
  if (result) {
    const [part, _] = result;
    return part;
  }
  return null;
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
