import express from 'express';
const app = express()
const port = 5000

app.set('view engine', 'hbs');
app.set('views', 'src/views');

app.use("/assets",express.static("src/assets"));

app.get('/', home);
app.get('/project',project);
app.get('/project-detail',projectdetail);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function home(req, res) {
  res.render("index")
}

function project(req, res) {
  res.render("project")
}

function projectdetail(req, res) {
  res.render("project-detail")
}
