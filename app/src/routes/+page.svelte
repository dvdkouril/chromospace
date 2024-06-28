<script lang="ts">
	import ChromospaceApp from "$lib/ChromospaceApp.svelte";
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

<h1>chromospace</h1>
<p>
	Yayyy, what's up, welcome to chromospace! This page will only get better and
	better. The idea is to have this as a sort of landing page but also a life
	version of the chromospace app where you should be able to load up your
	models, specify the view configs, and make screenshots and stuff.
</p>

<ChromospaceApp />

<style>
	* {
		font-family: "Dosis", sans-serif;
	}
</style>
