export const fetchedBlobURLToDataURL = (blobUrl) => {
	fetch(blobUrl).then(async (response) => {
		var reader = new FileReader();

		reader.addEventListener(
			"load",
			function () {
				const blobAsDataUrl = this.result;
				console.log(`\nUsing Fetch:\n ${blobAsDataUrl} \n\n`);
			},
			false
		);

		const blob = await response.blob();
		reader.readAsDataURL(blob);
	});
};
