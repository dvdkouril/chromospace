# design decisions
- multiplatform and usable on as many devices as possible
    - not limiting it to webgpu-enabled browsers
    - advanced features possible in environments with proper graphics capabilities
- usable in multiple contexts
    - usage through gosling is one case
    - but also: my own (hiperwindows) prototype
    - possibly other separate applications only using 3D data
- lightweight: do only one thing, but very well
- well-defined interface, ready for integration with other libraries

# major components
- 3D viewport:
    - holds the data
    - has 1+ cameras
    - 
- Data loaders
- Renderer:
    - probably start with basic mesh renderer
    - implicit surface rendering via impostors

# 3D chromatin data
- bin positions (XYZ)
- bin resolution (i.e., 1 bin = ? nucleobases)
- genomic coordinates (possible that the 3D model only captures a part of the genome)
- model scale (?)

# library name ideas
small module for rendering chromatin data
tribit?
mohair
3d, three, tri
3bit - like the candy
anything that's based on vis, three, 3D, genome...sucks
some german word?