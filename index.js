//const express = require('express')
import express from 'express';
const app = express()
const port = 5000

app.set('view engine', 'hbs');
app.set('views', 'src/views');

app.use("/assets",express.static("src/assets"));

app.get('/', (req, res) => {
  res.render("index")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
