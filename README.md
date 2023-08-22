# 3D genome rendering experiments (WIP)

This is a repository for experiments with various methods for rendering 3D genome models. This will be a continuation of work that Chromoskein started. In this evolution, we wish to make few changes:
- base the code on an existing framework with an established structure, ecosystem, and community; this will also help with the following point:
- support more browsers and versions besides the most recent ones supporting WebGPU (requirement in Chromoskein)
- focus on re-use in different projects: 3D gosling grammar, hyperwindows, jupyter notebook integration, ...

The task of this repository is to store experiments with different rendering techniques, frameworks & libraries, and code structuring. The outcome should be a new repository probably under the Gosling/HMS/DBMI organizations.

MVP Requirements:
- [ ] loading basic 3D genome structure file formats
- [ ] combine webgl and webgpu
- [ ] typical mesh rendering: as a baseline
- [ ] implicit surface rendering
- [ ] representations: spheres, tubes
- [ ] SSAO

High-level tasks and goals:
- [ ] Dissect chromoskein rendering code
- [ ] Learn limits of implicit surface rendering without WebGPU (only WebGL)
- [ ] Compare existing frameworks and see whether there's an option better than three.js (current favorite)
