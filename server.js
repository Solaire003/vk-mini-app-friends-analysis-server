const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fetch = require('node-fetch');
const { Canvas, Image, ImageData } = canvas;
const Blob = require("cross-blob");

faceapi.env.monkeyPatch({ fetch: fetch, Canvas, Image, ImageData })

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req, res) => {
  const { photos } = req.body;
  console.log(`length`,photos.length);

  const formattedPhotos = photos.map(({ sizes }) => sizes.pop().url);
  const all = [];

  formattedPhotos.forEach((el, i) => {
    const detect = async () => {
      const img = await canvas.loadImage(el)
      console.log(i);
      return faceapi.detectAllFaces(img).withFaceExpressions();
    };

    all.push(detect());
  });

  await Promise.all(all).then((result) => {
    const formatedResults = result.map((el, index)=>{
     return  {
        url: formattedPhotos[index],
        analise: result[index]
      }
    })
    console.log("DONE");
    res.json({ result: formatedResults });
  });
});

app.listen(port, async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
  await faceapi.nets.faceExpressionNet.loadFromDisk('./models');
  console.log('faceapi loaded!');
  console.log(`Example app listening at http://localhost:${port}`);
});