import { test } from "vitest";

// import { ChromatinBasicRenderer } from "../main";

test("empty", () => {});

// test("renderer constructor: no params", () => {
//   const options = {};
//   const r = new ChromatinBasicRenderer(options);
//   const c = r.getCanvasElement();
//
//   const parent = new HTMLElement;
//   parent.appendChild(c);
//
//   expect(c.width).toBe(parent.clientWidth);
//   expect(c.height).toBe(parent.clientHeight);
// });
//
// test("renderer constructor: width and height", () => {
//   const options = {
//     width: 800,
//     height: 600,
//   };
//   const r = new ChromatinBasicRenderer(options);
//   const c = r.getCanvasElement();
//   expect(c.width).toBe(800);
//   expect(c.height).toBe(600);
// });
//
// test("renderer constructor: only width", () => {
//   const options = {
//     width: 1920,
//   };
//   const defaultAspectRatio = 16 / 9;
//   const r = new ChromatinBasicRenderer(options);
//   const c = r.getCanvasElement();
//   expect(c.width).toBe(1920);
//   expect(c.height).toBe(1920 / defaultAspectRatio);
// });
//
// test("renderer constructor: only height", () => {
//   const options = {
//     height: 1080,
//   };
//   const defaultAspectRatio = 16 / 9;
//   const r = new ChromatinBasicRenderer(options);
//   const c = r.getCanvasElement();
//   expect(c.width).toBe(1080 * defaultAspectRatio);
//   expect(c.height).toBe(1080);
// });
