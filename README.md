# chromospace 🧬🚀

> Visualize chromatin in space!

## Try it out
Locally:
```
git clone git@github.com:dvdkouril/chromospace.git
cd chromospace
npm install
npm run dev
```

In ObservableHQ:
[https://observablehq.com/d/e2ead2e7f6700493](https://observablehq.com/d/e2ead2e7f6700493)

## Key concepts

### Genomics semantics

Molecular visualization tools are often used for examining chromatin 3D data. The limiting factor in that case are the missing proper semantics when analyzing the spatial structures. Our goal here is to provide API that fixes that. For example:

Fetching parts of the model should be done semantically using genomic coordinates:

```typescript
let selectedPart = structure.getPartCoords("chr1:10000-20000");
let selectedPart = structure.getPartBins(123, 321); // it should still be possible to fetch directly by bin indices
```

### Made for computational notebooks

Integration in Jupyter Notebook/Lab, Google Colab, Observable is a critical feature.

[ObservableHQ notebook example](https://observablehq.com/d/e2ead2e7f6700493)

### Stay small and focused

This library will only do one thing, hopefully extremely well: visualize 3D chromatin structure with a variety of declaratively specified representations. 
What it will _not_ do is expand into a bloated library with many options. Additional functionality should be built on top, as further libraries and applications.

### Configuration via grammar

With Gosling in mind, all visualization attributes should be defined through a grammar specification.

## Authors
Led by [David Kouril](http://davidkouril.com) @ [HIDIVE lab](http://hidivelab.org) (Harvard Medical School).
