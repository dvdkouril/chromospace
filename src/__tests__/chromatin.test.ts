import { expect, test } from "vitest";

import { coordinateToBin } from "../utils.ts";
import { get } from "../chromatin.ts";
import { parse3dg } from "../data-loaders/tsv-parser.ts";

test("coordinateToBin simple", () => {
  //~ In an aligned sequence, and for bins with resolution
  //~ of 10, a 22nd basebair will fall into the 3rd bin (index 2)
  expect(coordinateToBin(22, 10)).toBe(2);
});

test("coordinateToBin with start offset", () => {
  expect(coordinateToBin(33, 10, 20)).toBe(1);
});


const fetchTsv = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    const fileContent = await response.text();
    return fileContent;
};

test("get chromosome", async () => {
  const urlTan2018 = "https://dl.dropboxusercontent.com/scl/fi/lzv3ba5paum6srhte4z2t/GSM3271406_pbmc_18.impute.3dg.txt?rlkey=dc7k1gg5ghv2v7dsl0gg1uoo9&dl=0";
  const fileTan2018 = await fetchTsv(urlTan2018);
  const testModel = parse3dg(fileTan2018 , { center: true, normalize: true });

  expect(testModel).toBeDefined();

  const chr15patPart = get(testModel!, "15(pat)");
  expect(chr15patPart).toBeDefined();
  expect(chr15patPart?.label).toBe("15(pat)");
  expect(chr15patPart?.chunk.bins.length).toBe(825);

  const chr1patPart = get(testModel!, "1(pat)");
  expect(chr1patPart).toBeDefined();
  expect(chr1patPart?.label).toBe("1(pat)");
  expect(chr1patPart?.chunk.bins.length).toBe(2487);
});
