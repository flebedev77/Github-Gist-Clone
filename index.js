const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware to serve files from "uploads" directory
app.use((req, res, next) => {
    const requestedFilePath = path.join(__dirname, "uploads", path.basename(req.url));

    fs.readdir("uploads", (err, files) => {
        if (err) {
            console.error(err);
            return next(); // Pass control to the next middleware
        }

        // Check if requested file exists in the "uploads" directory
        if (files.includes(path.basename(req.url))) {
            if (req.url.includes("raw")) res.setHeader("Content-Type", "text/plain");
            return res.sendFile(requestedFilePath);
        }

        // If file is not found, continue to the next middleware
        next();
    });
});

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Folder to store the uploaded files
    },
    filename: (req, file, cb) => {
        const filename = req.body.filename || `UNKNOWN-${Date.now()}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Create an "uploads" directory if it doesn"t exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
const gistDir = path.join(__dirname, "gists");
if (!fs.existsSync(gistDir)) {
    fs.mkdirSync(gistDir);
}

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.redirect(req.file.filename);
});

app.post("/gist-upload", (req, res) => {
    const data = {
        id: crypto.randomUUID(),
        title: req.body["gist-title"],
        content: req.body["gist-content"]
    }

    if (data.title == undefined || data.content == undefined) {
        res.status(403).send("Title or content not provided");
        return;
    }

    fs.writeFile(gistDir + `/${data.id}.gist`, JSON.stringify(data), (err) => {
        if (err) {
            res.status(501).send("Failure to write gist");
            console.error(err);
            return;
        }

        res.redirect("/gists/" + data.id);
    })
})

app.get("/uploads", (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(501).send(err.toString());
        }

        let html = "<ul>";
        files.forEach((file) => {
            html += `<li><a href="/${file}">${file}</a></li>`;
        });
        html += "</ul>";

        res.send(html);
    });
});

app.get("/gists/:gistID", (req, res) => {
    const gistID = req.params.gistID;

    try {
        const data = JSON.parse(fs.readFileSync(path.join(gistDir, gistID + ".gist"), "utf8"));
        res.render("gist", {
            title: data.title,
            id: data.id,
            content: data.content
        })
    } catch (error) {
        res.status(501).send("Error reading gist");
        console.error(error);
        return;
    }
})

app.get("/gists", (req, res) => {
    fs.readdir(gistDir, (err, gists) => {
        if (err) {
            res.status(501).send("Error reading gists");
            console.error(err);
            return;
        }
        const gistData = [];
        gists.forEach((gist) => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(gistDir, gist), "utf8"));
                gistData.push({
                    id: data.id,
                    title: data.title,
                });
            } catch (error) {
                res.status(501).send("Error reading " + gist);
                console.error(error);
                return;
            }
        })
        res.render("gistlist", {
            gists: gistData
        })
    })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
