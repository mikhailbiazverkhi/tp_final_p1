// Importation du module Mongoose
const mongoose = require("mongoose");

// Extraction de la classe Schema du module Mongoose
const schema = mongoose.Schema;

// Définition du schéma du video
const videoSchema = schema({
  titre: {
    type: String,
    maxlength: [150, "Titre trop long"],
    minlength: [1, "Titre trop court"],
    required: [true, "Champ requis"],
  },
  description: {
    type: String,
    maxlength: [500, "Description trop longue"],
    minlength: [1, "Description trop courte"],
    required: [true, "Champ requis"],
  },
  category: {
    type: String,
    maxlength: [100, "Category trop longue"],
    minlength: [1, "Category trop courte"],
    required: [true, "Champ requis"],
  },
  chemin: {
    type: String,
    maxlength: [300, "Chemin trop long"],
    minlength: [1, "Chemin trop court"],
    required: [true, "Champ requis"],
  },
});

// Création du modèle de tweet à partir du schéma
const Video = mongoose.model("video", videoSchema);

// Exportation du modèle de video pour une utilisation ultérieure
module.exports = Video;
