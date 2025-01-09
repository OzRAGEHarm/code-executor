let editedFile = null; // Store the edited file content
let originalCode = ''; // Store the original code
let selectedFolder = null; // Store the selected folder
let selectedFile = null; // Store the selected file

// Map to keep track of changes in files
const fileChanges = new Map();

/*var inps = document.querySelectorAll('input');
[].forEach.call(inps, function(inp) {
if (inp.hasAttribute('webkitdirectory')) {
        inp.onchange = function(e) {
            listFiles(inp.files);
        };
    }
});*/

const folderInput = document.getElementById("file");
folderInput.addEventListener("change", handleDirectorySelect);
[].forEach.call(inps, function(inp) {
    inp.onchange = function(e) {
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            if (file.isDirectory) {
                const directoryButton = document.createElement("button");
                const directoryName = file.name;
                directoryButton.textContent = directoryName;
                directoryButton.className = "directory-button";
                directoryButton.addEventListener("click", () => {
                // When a directory is clicked, display a dropdown menu with all the files inside of it
                const dropdownMenu = document.createElement("div");
                dropdownMenu.className = "dropdown-menu";

                // Get all the files in the directory
                const files = file.listFiles();

                // Add a button for each file to the dropdown menu
                files.forEach(file => {
                    const fileButton = document.createElement("button");
                    fileButton.textContent = file.name;
                    fileButton.className = "file-button";
                    fileButton.addEventListener("click", () => {
                    // When a file in the dropdown menu is clicked, display its contents
                    viewFile(file);
                    });
                    dropdownMenu.appendChild(fileButton);
                });

                // Append the dropdown menu to the directory button
                directoryButton.appendChild(dropdownMenu);
                });

                const fileListContainer = document.getElementById("file-list");
                fileListContainer.appendChild(directoryButton);
            } else {
                // Create a button for the file
                const fileButton = document.createElement("button");
                const fileName = file.name;
                fileButton.textContent = fileName;
                fileButton.className = "file-button";
                fileButton.addEventListener("click", () => {
                // When a file is clicked, display its contents
                viewFile(file);
                });

                const fileListContainer = document.getElementById("file-list");
                fileListContainer.appendChild(fileButton);

                // Create an entry for the file in the changes map
                fileChanges.set(fileName, {
                    content: null,
                    changed: false,
                });
            }
        }
    };
});

async function getDirectoryPath(fileInput) {
    const directoryFile = fileInput.files[0];
    const directoryPath = await directoryFile.readAsText();

    return directoryPath;
}

async function handleDirectorySelect() {
    const fileInput = document.getElementById("file");
    const selectedFileName = document.getElementById("selected-file-name");

    if (fileInput.files.length > 0) {
        document.getElementById("code").value = "";
        originalCode = "";
        editedFile = null;

        const directoryPath = await getDirectoryPath(fileInput);

        if (directoryPath !== "") {
            const directoryEntries = directoryPath
                .split("/")
                .map((entry) => ({ name: entry }));

            selectedFolder = directoryEntries[0];
            selectedFileName.textContent = `Selected Folder: ${directoryPath}`;

            // Update the file list
            await listFiles(directoryEntries);
        }
    } else {
        selectedFileName.textContent = "";
        selectedFolder = null;

        // Clear the file list
        document.getElementById("file-list").innerHTML = "";
    }
}

function listFiles(directoryEntry) {
    const fileListContainer = document.getElementById("file-list");
    fileListContainer.innerHTML = "";

    const directoryButton = document.createElement("button");
    directoryButton.textContent = directoryEntry.name;
    directoryButton.className = "directory-button";

    // Create a dropdown menu for the directory
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    directoryButton.appendChild(dropdownMenu);

    // Get all the files in the directory
    const directoryContents = [];
    for (const subfile of directoryEntry.listFiles()) {
        directoryContents.push(subfile.name);
    }

    // Add a button for each file to the dropdown menu
    directoryContents.forEach(fileName => {
        const fileButton = document.createElement("button");
        fileButton.textContent = fileName;
        fileButton.className = "file-button";
        fileButton.addEventListener("click", () => {
        // When a file is clicked, display its contents
        viewFile(directoryEntry, fileButton.textContent);
        });
        dropdownMenu.appendChild(fileButton);
    });

    // Append the directory button to the file list container
    fileListContainer.appendChild(directoryButton);
}
  
function viewFile(directoryEntry, fileName) {
    const fileEntry = directoryEntry.getFile(fileName);
    const reader = new FileReader();
    reader.onload = function(event) {
        const codeTextarea = document.getElementById("code");
        codeTextarea.value = event.target.result;
    };
    reader.readAsText(fileEntry);
}  

function showSaveButton(fileName) {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Changes";
    saveButton.id = "save-button";
    saveButton.addEventListener("click", () => {
        saveFileChanges(fileName);
    });
    const fileListContainer = document.getElementById("file-list");
    const existingSaveButton = document.getElementById("save-button");
    if (!existingSaveButton) {
        fileListContainer.appendChild(saveButton);
    }
}

function saveFileChanges(fileName) {
    if (fileName) {
        const fileChange = fileChanges.get(fileName);

        if (fileChange && fileChange.changed) {
            const newContent = document.getElementById("code").value;

            // Update the editedFile and changes map
            editedFile = newContent;
            fileChange.content = newContent;
            fileChange.changed = false;

            // Send the modified content to the server to save it
            saveModifiedContentOnServer(fileName, newContent);
        }
    }
}

/*async function listFiles(directory) {
    const fileListContainer = document.getElementById("file-list");
    fileListContainer.innerHTML = "";

    // Request read access to the directory using the File System Access API
    try {
        const dirHandle = await window.showDirectoryPicker({
            startIn: directory
        });

        for await (const [name, entry] of dirHandle) {
            if (entry.isDirectory) {
                // Create a dropdown menu for the directory
                const directoryButton = document.createElement("button");
                directoryButton.textContent = entry.name;
                directoryButton.className = "directory-button";
                directoryButton.addEventListener("click", () => {
                // When the directory is clicked, display a dropdown menu with all the files inside of it
                const dropdownMenu = document.createElement("div");
                dropdownMenu.className = "dropdown-menu";

                // Get all the files in the directory
                const files = entry.listFiles();

                // Add a button for each file to the dropdown menu
                files.forEach(file => {
                    const fileButton = document.createElement("button");
                    fileButton.textContent = file.name;
                    fileButton.className = "file-button";
                    fileButton.addEventListener("click", () => {
                        // When a file in the dropdown menu is clicked, display its contents
                        viewFile(file);
                    });
                    dropdownMenu.appendChild(fileButton);
                });

                // Append the dropdown menu to the directory button
                directoryButton.appendChild(dropdownMenu);

                // Display the dropdown menu
                directoryButton.classList.toggle("active");
                });

                fileListContainer.appendChild(directoryButton);
            }
        }
    } catch (error) {
        console.error("Error accessing directory:", error);
    }
}

function viewFile(fileEntry) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const codeTextarea = document.getElementById("code");
        codeTextarea.value = event.target.result;
        originalCode = event.target.result; // Store the original code
        editedFile = event.target.result; // Store the edited file content
        selectedFile = fileEntry;

        // Update the changes map
        fileChanges.set(fileEntry.name, {
            content: event.target.result,
            changed: false,
        });

        // Show the Save button or update it
        showSaveButton(fileEntry.name);
    };
    reader.readAsText(fileEntry);
}*/

function runCode() {
    const code = document.getElementById("code").value;
    const language = document.getElementById("language").value;

    // Clear previous console output
    const consoleOutputElement = document.getElementById("console-output");
    consoleOutputElement.innerHTML = '';

    // Override console.log to redirect its output
    const originalConsoleLog = console.log;
    console.log = function(message) {
        originalConsoleLog.apply(console, arguments); // Output to the browser console
        const consoleOutputElement = document.getElementById("console-output");
        consoleOutputElement.innerHTML += message + '<br>'; // Output to the HTML page
    };

    fetch("/run-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
    })
    .then(response => response.json())
    .then(data => {
        const outputElement = document.getElementById("output");
        outputElement.textContent = data.output || data.error;
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function runCommand() {
    const command = document.getElementById("shell").value;
    
    fetch("/run-command", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
    })
    .then(response => response.json())
    .then(data => {
        const outputElement = document.getElementById("output");
        outputElement.textContent = data.output || data.error;
        document.getElementById("shell").value = '';
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function showSaveButton(fileName) {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Changes";
    saveButton.id = "save-button";
    saveButton.addEventListener("click", () => {
        saveFileChanges(fileName);
    });
    const fileListContainer = document.getElementById("file-list");

    // Check if a Save button already exists for the file
    const existingSaveButton = document.getElementById("save-button");
    if (!existingSaveButton) {
        fileListContainer.appendChild(saveButton);
    }
}