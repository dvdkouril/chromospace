import './style.css'
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer.ts";

let appEl = document.querySelector<HTMLDivElement>('#app')!;
const w = 800;
const h = 600;

//~ create renderer
const renderer = new ChromatinBasicRenderer();

//~ add canvas to the page
if (renderer.canvasElement) {
    renderer.canvasElement.width = w;
    renderer.canvasElement.height = h;
    appEl.appendChild(renderer.canvasElement);
}

//~ initialize render loop
renderer.startDrawing();


