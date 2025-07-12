//import { fail } from "node:assert";
import { expect, test } from "vitest";
//import { loadFromURL } from "../data-loaders/arrow.ts";
//import { get } from "../selections.ts";
import { coordinateToBin } from "../utils.ts";

test("coordinateToBin simple", () => {
  //~ In an aligned sequence, and for bins with resolution
  //~ of 10, a 22nd basebair will fall into the 3rd bin (index 2)
  expect(coordinateToBin(22, 10)).toBe(2);
});

test("coordinateToBin with start offset", () => {
  expect(coordinateToBin(33, 10, 20)).toBe(1);
});

//test("get chromosome", async () => {
//  const testModel = (await loadFromURL(
//    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
//    { center: true, normalize: true },
//  )) as ChromatinModel;
//  expect(testModel).toBeDefined();
//
//  // biome-ignore lint/style/noNonNullAssertion: We are in a test file
//  const chr15patPart = get(testModel!, "15(pat)");
//  expect(chr15patPart).toBeDefined();
//  expect(chr15patPart).toBeTruthy();
//  if (chr15patPart != null) {
//    const [part, selection] = chr15patPart;
//    expect(part.label).toBe("15(pat)");
//    expect(part.chunk.bins.length).toBe(825);
//    expect(selection.label).toBe("15(pat)");
//  } else {
//    fail();
//  }
//});

//test("get coordinates", async () => {
//  const testModel = (await loadFromURL(
//    "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
//    { center: true, normalize: true },
//  )) as ChromatinModel;
//  expect(testModel).toBeDefined();
//
//  expect(testModel).toBeDefined();
//
//  // biome-ignore lint/style/noNonNullAssertion: We are in a test file
//  const regionPart = get(testModel!, "15(pat):20000000-40000000");
//  expect(regionPart).toBeDefined();
//  expect(regionPart).toBeTruthy();
//  if (regionPart) {
//    const [part, selection] = regionPart;
//    expect(part.chunk.bins.length).toBe(200);
//    expect(part.coordinates.chromosome).toBe("15(pat)");
//    expect(part.coordinates.start).toBe(20000000);
//    expect(part.coordinates.end).toBe(40000000);
//    expect(selection.regions[0].start).toBe(20000000);
//    expect(selection.regions[0].end).toBe(40000000);
//  } else {
//    fail();
//  }
//});
