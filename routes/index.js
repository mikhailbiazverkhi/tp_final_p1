const router = require("express").Router();
const Video = require("../database/models/video.model");
const path = require("path"); // Path (un module natif de Node.js)
const multer = require("multer"); // Multer (un middleware pour Express.js)
const fs = require("fs"); // File System (un module natif de Node.js)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// redirect de "/" à "/videos"
router.get("/", (req, res) => {
  res.redirect("/videos");
});

//form "upload video"
router.get("/videos/upload", (req, res) => {
  res.render("videos/video-form"); // video-form.pug
});

//show video-list
router.get("/videos", async (req, res) => {
  try {
    // OK 200
    const videos = await Video.find({}).exec();

    if (videos.length === 0) {
      return res.status(404).render("videos/error", {
        message: "Aucune vidéo trouvée",
      });
    }

    res.render("videos/video-list", { videos });
  } catch (err) {
    res.status(500).render("videos/error", {
      message: "Erreur serveur ou problème avec la base de données",
    });
  }
});

//Add Video info to MongoDB and upload video to folder "uploads"
router.post("/uploadvideo", upload.single("chemin"), async (req, res) => {
  const { body, file } = req;
  body.chemin = file.path;
  body.filename = file.filename;

  console.log(body);

  // Check the file extension here before attempting to save
  const fileExtension = file.originalname.split(".").pop();
  if (fileExtension !== "mp4") {
    return res.status(400).render("videos/error", {
      message:
        "Error 400 - Mauvais format du fichier. Seuls les fichiers .mp4 sont autorisés.",
    });
  }
  // Create a new instance of the Video model with MongoDB data

  try {
    // OK 200
    const newVideo = new Video(body);
    await newVideo.save();
    // res.status(200).json({ message: "Vidéo téléchargée avec succès." });
    res.redirect("/");
  } catch (err) {
    if (err) {
      return res.status(400).render("videos/error", {
        message:
          "Error 500 - Erreur serveur ou problème avec la base de données.",
      });
    }
  }
});

//Streaming video
router.get("/videos/stream/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const videoPath = path.join(__dirname, "../uploads", filename);

  // Check if the video file exists
  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If the file doesn't exist, render the error page
      return res.status(404).render("videos/error", {
        message: "Error 404 - La vidéo demandée n'est pas trouvée",
      });
    }

    // Get the file size
    const fileSize = stats.size;

    // If the request doesn't contain a Range header, send the entire video file
    const fileStream = fs.createReadStream(videoPath);
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4", // Set the appropriate MIME type for your video
    });

    fileStream.pipe(res);

    // Handle errors from the file stream
    fileStream.on("error", (err) => {
      console.error("Error reading video file:", err);
      // Respond with a 500 Internal Server Error status and message
      res.status(500).render("videos/error", {
        message:
          "Error 500 - Erreur serveur ou problème avec la lecture du fichier vidéo",
      });
    });
  });
});

module.exports = router;
