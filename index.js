const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT | 8080;

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const filepath = (req.body.filename != undefined) ? req.body.filename : "UNKNOWN " + Date.now();
    cb(null, filepath);
  }
});

const upload = multer({ storage: storage });

// Create an 'uploads' directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.redirect(req.file.filename);
});

app.get("/uploads", (req, res) => {
    fs.readdir("uploads", (err, files) => {
        if (err) {
            console.error(err);
            return res.status(501).send(err.toString());
        }
        let html = `
        <ul>
        `
        files.forEach((file) => {
            html += `<li><a href="/${file}">${file}</a></li>`
        })

        html += "</ul>";

        res.send(html);
    })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
