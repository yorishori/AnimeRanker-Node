
function getJson(path){
	return new Promise((res,rej)=>{
		fetch(path,{method:"GET"})
		.then((res) => res.json())
		.then((data) => res(data))
		.catch((error) => {
			console.log(error);
			rej(error);
		});
	});
}

function postJson(path, body){
	return new Promise((res,rej)=>{
		fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body: body})
		.then((res) => res.json())
		.then((data) => res(data))
		.catch((error) => {
			console.log(error);
			rej(error);
		});
	});
}

function getTraktAPI(endpoint){
	return new Promise((res,rej)=>{
		fetch(
			`https://api.trakt.tv/${endpoint}`,
			{
				method:"GET",
				headers:{
					"Content-Type":"application/json",
					"trakt-api-key":"b30f67bd636582ea78a102c54c7ee240c0ecda395f297ca87b5a4185a888b139",
					"trakt-api-version":2
				}
			}
		).then((res) =>res.json())
		.then((data) => res(data))
		.catch((error) => {
			console.log(error);
			rej(error);
		});
	});
}


function getSaves(){
	getJson("/saves/headers", (data)=>{
		
	});
}

async function newRanker(){
	openLoader();
	// Check if there is a file in the input
	const fileInput = document.getElementById('fileInput');
	const files = fileInput.files;
	if(files.length != 1){
		showNotification('Please select choose one file from your system :(');
		closeLoader();
		return;
	}

	// Check if the file is a CSV
	const file = files[0];
	if(file.type != 'text/csv' && !file.name.endsWith('.csv')){
		showNotification('It must be a CSV file :(');
		closeLoader();
		return;
	}
	// Check if the file is valid
	const json = await csvToJson(file, ',').catch((e)=>{
		showNotification(e.message);
		closeLoader();
		return;
	});

	// Post to back-end
	await postJson('/newData',JSON.stringify(json));
	closeLoader();
}
/*
		Utilities
*/
function csvToJson(csvFile, separator){
	return new Promise((res, rej)=>{
		const reader = new FileReader();
		// file on load callback
		reader.onload = function(e) {
			const lines = e.target.result.split("\n");
			const headers = lines[0].split(separator);

			if(lines.length<=1 || headers.length<=0)
				rej(new Error("Not a good CSV :("));

			const result = [];

			for(let i = 1; i < lines.length; i++){
				const obj = {};
				const currentLine = lines[i].split(separator);
				for(let j = 0; j < headers.length; j++){
					obj[headers[j]] = currentLine[j];
				}
				result.push(obj);
			}
			res(result);
		};

		// file on error callback
		reader.onerror = function(e) {
            rej(new Error('Error reading file :('));
		};

		// read file
		reader.readAsText(csvFile);
	});
	
}

/*
		CUSTOM COMPONENTS
*/
// Modal Component
function openModal(title, message, onOk) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50';

    // Create modal content
    modal.innerHTML = `
        <div class="bg-gray-800 text-green-50 p-6 rounded-lg shadow-lg max-w-sm w-full border-solid border-2 border-purple-500">
            <h2 class="text-lg font-semibold mb-4">${title}</h2>
            <p class="mb-6">${message}</p>
            <div class="flex justify-end space-x-3">
                <button 
                    class="px-4 py-2 text-green-50 bg-red-800 rounded hover:bg-red-400 hover:scale-110 focus:outline-none focus:ring" 
                    id="cancelButton">
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 text-green-50 bg-green-800 rounded hover:bg-green-400 hover:scale-110 focus:outline-none focus:ring" 
                    id="okButton">
                    OK
                </button>
            </div>
        </div>
    `;

    // Append modal to body
    document.body.appendChild(modal);

    // Add event listeners to buttons
    modal.querySelector('#cancelButton').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#okButton').addEventListener('click', () => {
        if (onOk) onOk();
        document.body.removeChild(modal);
    });
}

// Loader component
function openLoader() {
    // Create loader container
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50';

    // Create loader content
    loader.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 animate-spin text-green-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    `;

    // Append loader to body
    document.body.appendChild(loader);
}

function closeLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        document.body.removeChild(loader);
    }
}

// Notification Component
function showNotification(message) {
    // Create notification container
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg';

    // Add notification message
    notification.innerHTML = `
        <p>${message}</p>
    `;

    // Append notification to body
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification) {
            document.body.removeChild(notification);
        }
    }, 4000);
}
