<script>
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

<h1 class="text-5xl">chromospace</h1>
<nav>
	<ul class="flex space-x-4">
		<li>
			<a
				href="/"
				class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
				>home</a
			>
		</li>
		<li>
			<a
				href="/playground"
				class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
				>playground</a
			>
		</li>
		<li>
			<a
				href="/examples"
				class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
				>examples</a
			>
		</li>
	</ul>
</nav>

<slot />

<style lang="postcss">
	* {
		font-family: "Dosis", sans-serif;
	}
	:global(html) {
		background-color: #ffffff;
	}
</style>
