import { MarkTypes } from "../chromatin-types";

type ChromospaceSchema = {
  views: ChsView[],
};

type ChsView = {
  data: string,
  tracks: ChsTrack[],
};

type ChsTrack = {
  mark: MarkTypes,
  encoding: {
    position: string,
    color: string,
    size: string,
  },
};


const spec = `
{
    "views": [
        {
            "data": "test.xyz",
            "tracks": [
                {
                    "filter": "chr1:10000-20000",
                    "mark": "sphere",
                },
                {
                    "filter": "chr2",
                    "mark": "box",
                },
            ],
        },
]}
`;
const specJson = JSON.parse(spec);
const specTyped = specJson as ChromospaceSchema;
console.log(specTyped);
