<script lang="ts">
	import { Viewport3D } from '$lib/Viewport3D';
	import { onMount } from 'svelte';
	import { ChromatinScene } from '$lib/ChromatinScene';
	import { getRange } from '$lib/ChromatinModel';

	let test = 'test';

	onMount(() => {
		const canvas = document.querySelector('#c');

		if (canvas) {
			let viewport = new Viewport3D(canvas);
		} else {
			console.log('No canvas!');
		}

		//~ just sketching out the API
		let scene = new ChromatinScene();
		const models = scene.allModels();

		const testModel = (models.length > 0) ? models.at(0) : null;

		if (!testModel) return;

		// const partA = testModel.getRange("chr1:123-321"); //~ => bins: XYZ[] (range completely available)
		const partA = getRange(testModel, "chr1:123-321"); //~ => bins: XYZ[] (range completely available)
														  //~ => bins: XYZ[] (only part of the range was available; maybe error in this case?)
														  //~ => error (genomic coordinates range not available in the model)
														  //~ => also could have several results when a model has overlapping parts
	});
</script>

<div style="margin: 0;">
	<canvas id="c" />
</div>

<style>
	* {
		margin: 0;
		padding: 0;
	}
	html,
	body {
		margin: 0;
		height: 100%;
		padding: 0;
	}
	#c {
		width: 100%;
		height: 100%;
		display: block;
		position: absolute;
	}
</style>
