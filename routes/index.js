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
    const videos = await Video.find({}).exec();

    res.render("videos/video-list", { videos });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur interne du serveur");
  }
});

//Add Video info to MongoDB and upload video to folder "uploads"
router.post("/uploadvideo", upload.single("chemin"), async (req, res) => {
  const { body, file } = req;
  body.chemin = file.path;
  body.filename = file.filename;

  console.log(body);

  // Crée une nouvelle instance du modèle Video avec les donnnées MongoDB
  const newVideo = new Video(body);

  try {
    await newVideo.save();

    res.redirect("/");
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      (key) => err.errors[key].message
    );
    res.status(400).render("videos/video-form", { errors });
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
      return res
        .status(404)
        .render("videos/error", { message: "Video not found" });
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
      res.status(500).render("error", { message: "Internal Server Error" });
    });

    return;
  });
});

module.exports = router;
