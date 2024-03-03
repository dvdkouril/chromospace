# chromospace 🧬🚀
> Visualize chromatin in space!

## Key concepts
> [!CAUTION]
> This is a WIP research prototype.

### Genomics semantics
Molecular visualization tools are often used for examining chromatin 3D data. The limiting factor in that case are the missing proper semantics when analyzing the spatial structures. Our goal here is to provide API that fixes that. For example:
- accessing model parts by genomic coordinates
- support for typical genomic data formats

### Made for computational notebooks
Integration in Jupyter Notebook/Lab, Google Colab, Observable is a critical feature.

### Stay small and focused
This library will only do one thing, hopefully extremely well: Load a 3D model of chromatin, and render it using few specific representations, and allow simple interactions. What it will _not_ do is expand into a bloated library with many options. Additional functionality should be built on top, as further libraries and applications.

### Configuration via grammar
With Gosling in mind, all visualization attributes should be defined through a grammar specification.

## Code snippets
This might showcase what functionality we're trying to provide.

In the simplest terms, one chromatin part is a list of bin positions:
```typescript
type ChromatinPart = {
    bins: Vector3[];
    label: string;
};
```
One model can be composed of multiple parts (i.e., chromosomes):
```typescript
type ChromatinModel = {
    parts: ChromatinPart[];
    position: Vector3;
};
```

Scene is used to contain multiple model (think: HyperWindows use case):
```typescript
type ChromatinScene = {
    models: ChromatinModel[];
};
```

Loading 3D chromatin data:
```typescript
let part: ChromatinPart = loadChromatinPart("model.pdb");
let modelA: ChromatinModel = makeChromatinModel([part]); // explicitly make a model from just a single part

let model: ChromatinModel = loadChromatinModel("mouse-genome.pdb", "chromosomes.csv); // with information about chromosome segmentation for the 3D model

let model = load3DStructure("model.g3d"); // WashU Epigenome format
```

Fetching parts of the model should be done semantically using genomic coordinates:
```typescript
let selectedPart = structure.getPartCoords("chr1:10000-20000");
let selectedPart = structure.getPartBins(123, 321); // it should still be possible to fetch directly by bin indices
```
