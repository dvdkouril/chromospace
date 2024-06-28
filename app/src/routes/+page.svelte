<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";

	let chsApp: ChromospaceApp;

	function onScreenshotButtonClick() {
		chsApp.saveScreenshot();
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="true"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Dosis:wght@200..800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<h1 class="text-5xl">chromospace</h1>
<p class="w-1/2">
	Yayyy, what's up, welcome to chromospace! This page will only get better and
	better. The idea is to have this as a sort of landing page but also a life
	version of the chromospace app where you should be able to load up your
	models, specify the view configs, and make screenshots and stuff.
</p>
<button class="btn" on:click={onScreenshotButtonClick}>Save Screenshot</button>

<ChromospaceApp bind:this={chsApp} />

<!-- <style> -->
<!-- 	* { -->
<!-- 		font-family: "Dosis", sans-serif; -->
<!-- 	} -->
<!-- </style> -->

<style lang="postcss">
	* {
		font-family: "Dosis", sans-serif;
	}
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
