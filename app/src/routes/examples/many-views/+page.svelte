<script lang="ts">
	import { onMount } from "svelte";
	import {
		initScene,
		display,
		addModelToScene,
		loadFromURL,
		type ChromatinModel,
		addChunkToScene,
	} from "chromospace";
	import chroma from "chroma-js";

	let chromatinScene = initScene();

	// $: [renderer, canvas] = display(chromatinScene, {
	// 	alwaysRedraw: false,
	// });

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

		const numOfViews = 20;
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
			const [renderer, canvas] = display(chromatinScene, {
				alwaysRedraw: false,
			});

			if (canvas && appEl) {
				appEl.appendChild(canvas);
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
		/* background-color: red; */
		grid-template-columns: repeat(3, 1fr);
		gap: 10px; /* Spacing between grid items */
		border: 2px solid black;
	}
	.grid-item {
		background-color: lightblue;
		border: 1px solid darkblue;
		text-align: center;
		line-height: 100px; /* Center text vertically for this example */
		height: 300px;
	}
</style>
