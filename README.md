# chromospace 🧬🚀

> Visualize chromatin in space!

## Try it out
In ObservableHQ:
[https://observablehq.com/d/e2ead2e7f6700493](https://observablehq.com/d/e2ead2e7f6700493),

or locally:
```
git clone git@github.com:dvdkouril/chromospace.git
cd chromospace
npm install
npm run dev
```

## Key concepts
- **Genomics semantics**: Molecular visualization tools are often used for examining chromatin 3D data. The limiting factor in that case are the missing proper semantics when analyzing the spatial structures. For example, selecting part of the model should be possible using genomic coordinates (not "atom" indices): `let selectedPart = structure.getPartCoords("chr11:66546395-66563334");`
- **Made for computational notebooks**: We need to meet computational biologists where they typically work. Integration in computational notebooks is therefore a critical feature. As a Javascript library, integration in ObservableHQ is free ([ObservableHQ notebook example](https://observablehq.com/d/e2ead2e7f6700493)). Using chromospace in Python-based notebooks (e.g., Jupyter Notebook/Lab or Google Colab) is made thanks to the wonderful [anywidget](https://github.com/manzt/anywidget) library: see [chromospyce](https://github.com/dvdkouril/chromospyce).
- **Declarative specification**: With [Gosling](https://github.com/gosling-lang/gosling.js) in mind, visualization attributes should be defined through a declarative grammar specification to allow expressive visualization construction.
- **Staying small and focused**: The many bioinformatics file formats can lead to bloated software that tries to capture every use case. Such software is then hard to maintain. The idea here is to keep chromospace small, doing one thing, hopefully extremely well: visualize 3D chromatin structures with a variety of declaratively specified representations. Additional functionality should be build on top as further libraries and applications. With the computational notebooks integration, we can also afford to leave much of processing to the ecosystem of other bioinformatics tooling.

## Authors
Led by [David Kouril](http://davidkouril.com) @ [HIDIVE lab](http://hidivelab.org) (Harvard Medical School).
