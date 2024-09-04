<script lang="ts">
        import { onMount } from "svelte";
        import {
                parseTsv,
                addChunkToScene,
                initScene,
                display,
                loadFromURL,
                type ChromatinChunk,
        } from "chromospace";

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
                const testChunk = (await loadFromURL(
                        "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/dros.3.arrow",
                        { center: true, normalize: true },
                )) as ChromatinChunk;
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
                        scale: {
                                values: sineValues,
                                min: -100,
                                max: 100,
                                scaleMin: 0.01,
                                scaleMax: 0.03,
                        },
                        links: false,
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
