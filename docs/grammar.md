# grammar

Views might still be called views, although now it represents a 3D model (data + representation specification via tracks)

`Views` should represent separate models: by default they would be laid out in some grid.
`Tracks` are defined by:
1. region
2. visual mapping
    - mark: sphere, cube etc.
    - visual channels: size, color, orientation?, position???
        - it really doesn't make sense to expose the x, y, z channels for 3D data
        - gosling example: `point -> x, y, row, size, color, strokeWidth, opacity`
        - chromospace: `sphere -> _, _, ??, size, color, strokeWidth?, opacity`
        - let's first just focus on `size` and `color` of each mark: sphere, box,
        - specific to chromospace: I'm using essentially two data sources to make one visualization: 1) the 3D model, 2) the genomic track to map features onto the 3D model
```
{
    "views": [
        {
            "data": "test.xyz",
            "tracks": [
                {
                    "region" | "filter": "chr1:10000-20000",
                    "mark": "sphere",
                },
                {
                    "region" | "filter": "chr2",
                    "mark": "box",
                },
            ],
        },
        {
            "data": "whole-genome-model.pdb",
            "tracks": [
                {
                    "mark": "sphere",
                    //~ constant value
                    "color": {
                        "value": "steelblue"
                    }
                }
            ]
        },
    ],
}
```

brainstorming w/ Trevor:
```
{
  "datasets": {
    "combined": {
      "structure": {
        "type": "pdb",
        "url": "https://s3.amazonaws.com/3dmol-data/1crn.pdb"
      },
      "signal": {
        "type": "csv",
        "url": "https://s3.amazonaws.com/3dmol-data/1crn.csv"
      }
    }
  },
  "layers": [
    {
      "mark": "cube",
      "encoding": {
        "position": "structure",
        "color": {
          "constant": [0.8, 0.8, 0.8]
        },
        "size": 0.1
      }
    },
    {
      "mark": "cube",
      "data": "SELECT *, pileup(row_start) FROM combined.signal WHERE `signal` > 0.5",
      "encoding": {
        "position": "structure",
        "color": "signal:H3K5",
        "size": 1.0
      }
    },
    {

    }
  ]
}
```
