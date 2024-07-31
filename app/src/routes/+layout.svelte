<script>
	import { base } from "$app/paths";
	import "../app.css";
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

<div class="flex flex-col m-5">
	<h1 class="text-5xl">chromospace</h1>
	<nav>
		<ul class="flex space-x-4">
			<li>
				<a
					href="{base}/"
					class="text-2xl text-blue-600 dark:text-blue-500 hover:underline"
					>home</a
				>
			</li>
			<li>
				<a
					href="{base}/examples"
					class="text-2xl text-blue-600 dark:text-blue-500 hover:underline"
					>examples</a
				>
			</li>
		</ul>
	</nav>

	<slot />
</div>

<style>
	* {
		font-family: "Dosis", sans-serif;
	}
	:global(html) {
		background-color: #ffffff;
	}
</style>
