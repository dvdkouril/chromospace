<script lang="ts">
        import { onMount } from "svelte";
        import {
                parseTsv,
                addChunkToScene,
                initScene,
                display,
        } from "../../../src/main"; //~ TODO: this sucks, figure out how to use bare specifiers (via workspaces?)

        const fetchTsv = async (url: string) => {
                const response = await fetch(url);
                if (!response.ok)
                        throw new Error(`fetch failed: ${response.status}`);
                const fileContent = await response.text();
                return fileContent;
        };

        let chromatinScene = initScene();

        $: [renderer, canvas] = display(chromatinScene, {
                alwaysRedraw: false,
        });

        export const saveScreenshot = () => {
                console.log("saving screenshot");

                renderer.render();
                canvas.toBlob((blob) => {
                        saveBlob(
                                blob,
                                `screencapture-${canvas.width}x${canvas.height}.png`,
                        );
                });

                const saveBlob = function () {
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        a.style.display = "none";
                        return function saveData(blob, fileName) {
                                const url = window.URL.createObjectURL(blob);
                                a.href = url;
                                a.download = fileName;
                                a.click();
                        };
                };
        };

        onMount(async () => {
                const url =
                        "https://dl.dropboxusercontent.com/scl/fi/2lmqo9xo14bo8466xb2ia/dros.3.txt?rlkey=kb3zt0gjnh9h843y20rkrcq4a&e=1&dl=0";
                const fileContent = await fetchTsv(url);
                const testChunk = parseTsv(fileContent, {
                        center: true,
                        normalize: true,
                }); //~ parseTsv(data, center = true) ?
                const num = testChunk.bins.length;
                const sineWave = (
                        amplitude: number,
                        frequency: number,
                        length: number,
                ) =>
                        Array.from(
                                { length },
                                (_, i) => amplitude * Math.sin(frequency * i),
                        );
                const sineValues = sineWave(100, 0.2, num);

                const viewConfig = {
                        binSizeScale: {
                                values: sineValues,
                                min: -100,
                                max: 100,
                                scaleMin: 0.01,
                                scaleMax: 0.03,
                        },
                        makeLinks: false,
                        mark: "sphere",
                        color: {
                                values: sineValues,
                                min: 0,
                                max: 100,
                                colorScale: "viridis",
                        },
                };
                let chromatinScene = initScene();
                chromatinScene = addChunkToScene(
                        chromatinScene,
                        testChunk,
                        viewConfig,
                );
                const [renderer, canvas] = display(chromatinScene, {
                        alwaysRedraw: false,
                });

                //~ add canvas to the page
                let appEl = document.querySelector("#app");
                if (canvas && appEl) {
                        appEl.appendChild(canvas);
                }
        });
</script>

<div id="app"></div>
