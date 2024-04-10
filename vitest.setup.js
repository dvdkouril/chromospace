import fs from 'fs';
import { beforeAll } from 'vitest';
import 'vitest-canvas-mock'

const testDataDir = "test-data";
beforeAll(async () => {

	if (!fs.existsSync(testDataDir)){
		fs.mkdirSync(testDataDir);

		//~ Tan et al. 2018
		let url = "https://dl.dropboxusercontent.com/scl/fi/lzv3ba5paum6srhte4z2t/GSM3271406_pbmc_18.impute.3dg.txt?rlkey=dc7k1gg5ghv2v7dsl0gg1uoo9&dl=0";
		let filename = "tan2018.tsv";
		await downloadFile(url, filename);
	} else {
		console.log("no need to fetch test data");
	}
})

async function downloadFile(url, filename) {
	console.log("downloading: " + url);
	const file = await fetchFile(url);
	const path = testDataDir + "/" + filename;
	fs.writeFileSync(path, file);
}

async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    const fileContent = await response.text();
    return fileContent;
};

