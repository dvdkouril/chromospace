# 3D genome rendering experiments (WIP)

This is a repository for experiments with various methods for rendering 3D genome models. This will be a continuation of work that Chromoskein started. In this evolution, we wish to make few changes:
- base the code on an existing framework with an established structure, ecosystem, and community; this will also help with the following point:
- support more browsers and versions besides the most recent ones supporting WebGPU (requirement in Chromoskein)
- focus on re-use in different projects: 3D gosling grammar, hyperwindows, jupyter notebook integration, ...

The task of this repository is to store experiments with different rendering techniques, frameworks & libraries, and code structuring. The outcome should be a new repository probably under the Gosling/HMS/DBMI organizations.

## Key concepts
### Working with 3D models using genomic coordinates
The 3D models are often suplied simply as a list of XYZ coordinates. Without additional meta-data, such structure is of limited utility in any real work. We need to know what segment of the genome the 3D structure models in order to link it to other experimental data and visualizations.
In this library, users will be able to access the 3D data by specifying genomic coordinate ranges.

### Drop-in panel for 3D chromatin visualization
The library should be easily integrable into existing tools. For this it will need a clear API.

### Stay small and focused
This library will only do one thing, hopefully extremely well: Load a 3D model of chromatin, and render it using few specific representations, and allow simple interactions. What it will _not_ do is expand into a bloated library with many options. Additional functionality should be built on top, as further libraries and applications.

MVP Requirements:
- [ ] loading basic 3D genome structure file formats
- [ ] combine webgl and webgpu
- [ ] typical mesh rendering: as a baseline
- [ ] implicit surface rendering
- [ ] representations: spheres, tubes
- [ ] SSAO
- [ ] coloring of the structure

High-level tasks and goals:
- [ ] Dissect chromoskein rendering code
- [ ] Learn limits of implicit surface rendering without WebGPU (only WebGL)
- [ ] Compare existing frameworks and see whether there's an option better than three.js (current favorite)

## Next
(only one task allowed here)
- [ ] instanced mesh using threejs (reuse some of the threlte code)

## To Do
- [ ] basic instanced billboards in threejs
- [ ] loading data
  - [ ] PDB (easy, use from chromoskein)
  - [ ] nucle3d (4DN used format, text-based)


## Done or canceled
