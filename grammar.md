# grammar

Views might still be called views, although now it represents a 3D model (data + representation specification via tracks)

`Views` should represent separate models: by default they would be laid out in some grid.
`Tracks` are defined by:
1. region
2. visual mapping
    - mark: sphere, cube etc.
    - attributes of each mark: size, color, orientation?, position???
        - these are called "visual channels" in gosling
```
{
    "views": [
        {
            "tracks": [
                {
                }
            ]
            "data": "test.xyz",
        },
        {
            "data": "whole-genome-model.pdb",
        },
    ],
}
```
