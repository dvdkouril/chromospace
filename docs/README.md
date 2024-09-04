# chromospace documentation

## Main features:

- simple way to visualize 3D chromatin models
- easy to integrate in different environments and applications
- expressive linking of additional genomic data to the 3D structure (mainly via
  mapping to visual attributes)
- selecting parts based on genomic coordinates

## Quick start 

```typescript 
//~ load test data 
const testChunk = chs.loadFromURL("https://test.com/test.arrow", { center: true, normalize: true });

//~ config specifies how the 3D model will look 
const viewConfig = {
    scale: 0.01, 
    color: "red", 
};

//~ create a scene 
let chromatinScene = chs.initScene(); 
chromatinScene = chs.addChunkToScene(chromatinScene, testChunk, viewConfig);

const [renderer, canvas] = chs.display(chromatinScene, { alwaysRedraw: false});

//~ ObservableHQ only: mechanism for clean-up after cell re-render
invalidation.then(() => renderer.endDrawing());

return renderer.getCanvasElement(); 
```

## Data loading

The core chromospace library accepts only data that are in the [Apache
Arrow](https://arrow.apache.org) IPC data format.

### Why Arrow?

We've encountered several file formats used to store 3D coordinates of
chromatin bins. Some come from proteomics tools (such as `PDB` or `CIF`),
others are very general data file formats (e.g., `CVS`, `TSV`, `XYZ`). Few
tools define their own formats: `nucle3d`, `3dg`, or
[g3d](https://g3d.readthedocs.io/en/latest/intro.html). At their core, however,
all these formats store 3 floating-point numbers (xyz coordinates) and some
other columns (e.g., chromosome or genomic coordinate). Storing such
information in formats that are based on delimiter-separated text files is
often error prone and leads to incompatibility issues down the line.

[Apache Arrow](https://arrow.apache.org) is a standard for storing columnar
data in memory and on disk. It is much more widespread, which allows us to
leverage libraries and tools developed outside of computational biology. As a
standard data format, Arrow integrates much more seamlessly with other data
structures commonly used in data science. For example, it is very easy to
[convert to/from numpy arrays](https://arrow.apache.org/docs/python/numpy.html)
using the Python `pyarrow` library. Similarly [with
pandas](https://arrow.apache.org/docs/python/pandas.html).

### Converting to Arrow

To produce Arrow files from Python, we recommend consulting the Python Arrow
Cookbook [example for writing Arrow to
disk](https://arrow.apache.org/cookbook/py/io.html#saving-arrow-arrays-to-disk)

We provide also provide a script (written in JS, using
[deno](https://docs.deno.com)) for converting some of the above-mentioned file
formats to `.arrow` files.

More info: [scripts folder](/scripts)

## Core concepts

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
  scale?: number | AssociatedValuesScale; 
  color?: string | AssociatedValuesColor; 
  mark?: MarkTypes; 
  links?: boolean; 
}; 
```

The type unions with `AssociatedValuesScale` and `AssociatedValuesColor` exist
to support binding other genomic data values onto these visual channels,
instead of only setting them to constant value.

## Selections

In order to filter 3D models based on genomic coordinates, we provide functions
to select subparts of a chunk or model. Chunks allow only simple fetching by
bin indices.

Models, on the other hand, can be filtered based on genomic coordinates, thanks
to the fact that we know precisely which genomic parts a model represents.
