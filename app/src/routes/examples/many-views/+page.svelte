<script lang="ts">
	import { onMount } from "svelte";
	import {
		initScene,
		display,
		loadFromURL,
		type ChromatinModel,
		addChunkToScene,
	} from "chromospace";
	import chroma from "chroma-js";

	onMount(async () => {
		const tan2018Model = (await loadFromURL(
			"https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
			{
				center: true,
				normalize: true,
			},
		)) as ChromatinModel;

		//~ add canvas to the page
		// let appEl = document.querySelector("#app");
		let appEl = document.querySelector("#grid-test");

		const numOfViews = 4;
		for (let i = 0; i < numOfViews; i++) {
			const viewConfig = {
				scale: 0.005,
				links: false,
				mark: "sphere",
				color: chroma.random().hex(),
			};
			let chromatinScene = initScene();
			//~ take individual parts as chunks only
			const chunk = tan2018Model.parts[i].chunk;
			chromatinScene = addChunkToScene(chromatinScene, chunk, viewConfig);
			const [renderer, el] = display(chromatinScene, {
				alwaysRedraw: false,
			});

			if (el && appEl) {
				appEl.appendChild(el);
			}
		}
	});
</script>

<div class="text-xl py-2">
	<p>Many chromospace views.</p>
</div>
<div id="grid-test"></div>
<div id="app"></div>

<style>
	#grid-test {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 500px;
		gap: 10px; /* Spacing between grid items */
		border: 2px solid black;
	}
</style>
