# chromospace documentation

## Main features:

- simple way to visualize 3D chromatin models
- easy to integrate in different environments and applications
- expressive linking of additional genomic data to the 3D structure (mainly via
  mapping to visual attributes)
- selecting parts based on genomic coordinates

## Quick Start 

```typescript 
//~ load test data 
const testChunk = chs.parseTsv(text, { center: true, normalize: true });

//~ config specifies how the 3D model will look 
const viewConfig = {
    binSizeScale: 0.01, 
    coloring: "constant", 
};

//~ create a scene 
let chromatinScene = chs.initScene(); 
chromatinScene = chs.addChunkToScene(chromatinScene, testChunk, viewConfig);

const [renderer, canvas] = chs.display(chromatinScene, { alwaysRedraw: false});

//~ ObservableHQ only: mechanism for clean-up after cell re-render
invalidation.then(() => renderer.endDrawing());

return renderer.getCanvasElement(); 
```

## Core Concepts

## Chunk vs Model

There's no standard when it comes to producing 3D chromatin models. This
results in several file formats being used to transfer the XYZ bin positions,
along with the information about which genomic ranges the model represents. In
some cases, what we get is just the coordinates, which severely limits what we
can do with such data.

`ChromatinChunk` represents a single continuous, "anonymous", segment of DNA
divided into bins. The assumption is that these bins are consecutive on the DNA
sequence. The `ChromatinChunk` structure has no concept of what genomic region
it represents. Our goal with chromospace is to allow viewing also these simple
structures, without the need to specify false data just to see your structure.

```typescript
type ChromatinChunk = {
    bins: vec3[];
    /* ... */
}
```

On the other hand, `ChromatinModel` requires that its individual parts are
identified. `ChromatinModel` is composed of several `ChromatinParts` which each
contain a `ChromatinChunk` but with a genomic range identification.

```typescript
type ChromatinPart = {
  chunk: ChromatinChunk;
  coordinates: GenomicCoordinates;
  /* ... */
};

type ChromatinModel = {
  parts: ChromatinPart[];
  /* ... */
};
```

## View Config 

The main data loaded from a file is a sequence of XYZ coordinates of bins.
Points in space have no real appearance. Several other tools make assumptions
about the visual representation of bins.
We use a `ViewConfig` structure to define how a certain chromatin segment
should be displayed. 

```typescript 
export type ViewConfig = {
    binSizeScale?: number | AssociatedValuesScale; 
    color?: string | AssociatedValuesColor; 
    mark?: MarkTypes; makeLinks?: boolean; 
}; 
```

The type unions with `AssociatedValuesScale` and `AssociatedValuesColor` are to
support binding other data onto these visual channels.

## Selections

In order to filter 3D models based on genomic coordinates, we provide functions
to select subparts of a chunk or model.
