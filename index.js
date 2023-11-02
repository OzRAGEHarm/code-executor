const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

let activeProcess = null;
const directoryPath = path.join(__dirname, 'uploads'); // Directory for file operations

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
}

app.post('/run-code', (req, res) => {
    try {
        const code = req.body.code;
        const language = req.body.language;

        // Terminate the previous active process (if any)
        if (activeProcess) {
            activeProcess.kill();
        }

        if (language === 'python') {
            activeProcess = spawn('python', ['-c', code]);
        } else if (language === 'javascript') {
            activeProcess = spawn('node', ['-e', code]);
        } else if (language === 'c#') {
            activeProcess = spawn('dotnet', ['run', code]);
        }else {
            res.status(400).json({ error: 'Unsupported language' });
            return;
        }

        let output = '';
        let consoleLogOutput = '';

        // Capture and send output as soon as it's available
        activeProcess.stdout.on('data', (data) => {
            output += data.toString();
            consoleLogOutput += data.toString();
        });

        activeProcess.stderr.on('data', (data) => {
            output += data.toString();
            consoleLogOutput += data.toString();
        });

        activeProcess.on('close', (code) => {
            if (code === 0) {
                // Send the final response with output and consoleLogOutput
                res.json({ output, consoleLogOutput });
            } else {
                res.status(400).json({ output, consoleLogOutput });
            }
        });
    } catch (err) {
        res.status(400).json({ output: err.message, consoleLogOutput: '' });
    }
});

app.post('/run-command', (req, res) => {
    try {
        const command = req.body.command;

        // Terminate the previous active process (if any)
        if (activeProcess) {
            activeProcess.kill();
        }

        activeProcess = spawn(command, [], { shell: true });

        let output = '';
        let consoleLogOutput = '';

        // Capture and send output as soon as it's available
        activeProcess.stdout.on('data', (data) => {
            output += data.toString();
            consoleLogOutput += data.toString();
        });

        activeProcess.stderr.on('data', (data) => {
            output += data.toString();
            consoleLogOutput += data.toString();
        });

        activeProcess.on('close', (code) => {
            if (code === 0) {
                // Send the final response with output and consoleLogOutput
                res.json({ output, consoleLogOutput });
            } else {
                res.status(400).json({ output, consoleLogOutput });
            }
        });
    } catch (e) {
        res.status(500).json({ output: e.message, consoleLogOutput: '' });
    }
});

// Handle folder upload
/*app.post('/upload-folder', (req, res) => {
    try {
        const uploadedFiles = req.files.files; // Assuming you're using Express file handling middleware

        // Iterate over uploaded files and save them to the "uploads" directory
        uploadedFiles.forEach((file) => {
            const filePath = path.join(directoryPath, file.name);

            // Save the received file
            file.mv(filePath, (err) => {
                if (err) {
                    console.error('Error saving uploaded file:', err);
                }
            });
        });

        console.log('Uploaded folder contents saved to the "uploads" directory successfully.');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling folder contents upload:', error);
        res.sendStatus(500);
    }
});

// Handle saving modified file content
app.post('/save-file', (req, res) => {
    try {
        const fileName = req.body.fileName;
        const content = req.body.content;

        const filePath = path.join(directoryPath, fileName);

        // Delete the old file if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Create a new file with the updated content
        fs.writeFileSync(filePath, content);

        console.log(`Saved changes for file: ${fileName}`);
        res.sendStatus(200);
    } catch (error) {
        console.error(`Error saving changes for file: ${fileName}`, error);
        res.sendStatus(500);
    }
});

// List files in the folder
app.get('/list-files', (req, res) => {
    try {
        const files = fs.readdirSync(directoryPath);
        res.json({ files });
    } catch (error) {
        console.error("Error listing files in the folder:", error);
        res.sendStatus(500);
    }
});*/