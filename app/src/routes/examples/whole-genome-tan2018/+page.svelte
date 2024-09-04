<script lang="ts">
	import { onMount } from "svelte";
	import {
		initScene,
		display,
		addModelToScene,
		loadFromURL,
		type ChromatinModel,
	} from "chromospace";

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
		const tan2018Model = (await loadFromURL(
			"https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/model/model.arrow",
			{
				center: true,
				normalize: true,
			},
		)) as ChromatinModel;

		const viewConfig = {
			scale: 0.005,
			links: true,
			mark: "sphere",
		};
		let chromatinScene = initScene();
		if (tan2018Model) {
			chromatinScene = addModelToScene(
				chromatinScene,
				tan2018Model,
				viewConfig,
			);
		}
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

<div class="text-xl py-2">
	<p>Whole genome from Tan et al. 2018</p>
</div>
<div id="app"></div>
