const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware to serve files from 'uploads' directory
app.use((req, res, next) => {
    const requestedFilePath = path.join(__dirname, 'uploads', path.basename(req.url));
    
    fs.readdir('uploads', (err, files) => {
        if (err) {
            console.error(err);
            return next(); // Pass control to the next middleware
        }

        // Check if requested file exists in the 'uploads' directory
        if (files.includes(path.basename(req.url))) {
            if (req.url.includes("raw")) res.setHeader('Content-Type', 'text/plain');
            return res.sendFile(requestedFilePath);
        }

        // If file is not found, continue to the next middleware
        next();
    });
});

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to store the uploaded files
    },
    filename: (req, file, cb) => {
        const filename = req.body.filename || `UNKNOWN-${Date.now()}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Create an 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.redirect(req.file.filename);
});

app.get('/uploads', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            console.error(err);
            return res.status(501).send(err.toString());
        }

        let html = '<ul>';
        files.forEach((file) => {
            html += `<li><a href="/${file}">${file}</a></li>`;
        });
        html += '</ul>';

        res.send(html);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
