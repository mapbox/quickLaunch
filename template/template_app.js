const express = require("express");
const cors = require('cors')
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/"));

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://{db_url}:27017/{db_name}", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const FeaturesSchema = new mongoose.Schema({
  feature: Object,
  dateCreated: Date
});
const Feature = mongoose.model("feature", FeaturesSchema);

app.get("/", (req, res) => {
  // get file and send to client
  res.sendFile(__dirname + "/index.html");
});

app.post("/saveannotation", (req, res) => {
  const date = new Date();
  const feature = new Feature({
    feature: req.body,
    dateCreated: date
  });
  feature.save(error => {
    if (error) {
      console.error(error);
    } else {
      console.log("feature saved");
    }
  });
});

app.get("/getannotations", (req, res) => {
  // Get array of features in DB
  Feature.collection.find({}).toArray().then(array => {
    res.send(array);
  });
});

app.post("/deleteannotation", (req, res) => {
  Feature.collection.deleteOne({
    "id": req.body.id
  });
});


app.listen(port, () => {
  console.log("Server listening on port " + port);
});
