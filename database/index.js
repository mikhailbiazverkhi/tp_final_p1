const mongoose = require("mongoose");
const uri =
  "mongodb+srv://mikhailbiazverkhi:4LjV0skEticpO2yz@cluster0.hqcalfc.mongodb.net/video?retryWrites=true&w=majority";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });
