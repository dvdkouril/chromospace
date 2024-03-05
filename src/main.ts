import './style.css'
import { ChromatinBasicRenderer } from "./renderer/ChromatinBasicRenderer.ts";
import { parseTsv } from './data-loaders/tsv-parser.ts';
import { ChromatinScene, addChunkToScene } from './chromatin.ts';

// const testData = `
// 86.264829	49.017552	-44.123079
// 89.268308	58.618929	-20.945442
// 88.305441	81.359030	-9.974078
// 75.745795	81.864366	-31.892337
// 53.745219	77.316346	-43.455223
// 48.717193	102.077790	-43.455223
// 43.689168	126.839234	-43.455223
// 67.522793	121.280542	-49.737690
// 80.710633	131.892589	-68.496035
// 96.282066	121.280542	-85.328297
// 120.364455	128.860576	-86.324180
// 114.828858	130.376583	-61.717899
// 138.911247	137.956617	-62.713782
// 138.801804	126.333898	-40.279197
// 147.269182	122.796549	-16.737727
// 158.920457	101.067118	-11.215970
// 154.837988	93.487084	-34.970690
// 155.976503	99.045776	-59.592121
// 150.523794	78.327017	-72.986565
// 142.678896	100.056447	-83.218846
// 149.035295	123.807220	-89.041828
// 164.155166	105.109803	-96.801097
// `;


const fetchTsv = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    const fileContent = await response.text();
    return fileContent;
};

(async () => {
    const url = "https://dl.dropboxusercontent.com/scl/fi/2lmqo9xo14bo8466xb2ia/dros.3.txt?rlkey=kb3zt0gjnh9h843y20rkrcq4a&e=1&dl=0";
    const fileContent = await fetchTsv(url);
    const testChunk = parseTsv(fileContent, { center: true, normalize: true }); //~ parseTsv(data, center = true) ? 
    console.log(testChunk);

    //~ create a scene
    let chromatinScene: ChromatinScene = {
        chunks: [],
        models: [],
    };
    chromatinScene = addChunkToScene(chromatinScene, testChunk);
    console.log(chromatinScene);

    //~ create renderer
    const renderer = new ChromatinBasicRenderer();
    renderer.addScene(chromatinScene);

    //~ add canvas to the page
    let appEl = document.querySelector<HTMLDivElement>('#app')!;
    const w = 800;
    const h = 600;
    const canvas = renderer.getCanvasElement();
    if (canvas) {
        canvas.width = w;
        canvas.height = h;
        appEl.appendChild(canvas);
    }

    //~ initialize render loop
    renderer.startDrawing();
})();

