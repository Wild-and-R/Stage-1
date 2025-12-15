import express from 'express';
import { Client } from 'pg';
import multer from 'multer';
 
const client = new Client({
  user: 'postgres',
  password: 'ending',
  host: 'localhost',
  port: 5432,
  database: 'postgres',
})

await client.connect()

const app = express()
const port = 5000

app.set('view engine', 'hbs');
app.set('views', 'src/views');

app.use("/assets",express.static("src/assets"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', home);
app.get('/project',project);
app.post('/project', upload.single('image'), handleproject);
app.get('/project-detail/:id', projectdetail);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function home(req, res) {
  res.render("index")
}

async function project(req, res) {
  try {
    const result = await client.query('SELECT * FROM project ORDER BY id DESC');
    res.render("project", { projects: result.rows });
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
}

async function handleproject(req, res) {
  let { projectname, startdate, enddate, description, technologies } = req.body;
  if (!Array.isArray(technologies)) {
    technologies = technologies ? [technologies] : [];
  }
  const techString = technologies.join(', ');
  let imageBuffer = null;
  if (req.file) {
    imageBuffer = req.file.buffer;
  }
  try {
    await client.query(
      'INSERT INTO project (projectname, startdate, enddate, description, technologies, image) VALUES ($1, $2, $3, $4, $5, $6)',
      [projectname, startdate, enddate, description, techString, imageBuffer]
    );
    res.redirect('/project');
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
  
app.get('/project-image/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query('SELECT image FROM project WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].image) {
      return res.status(404).send('Image not found');
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].image);
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});
}

async function projectdetail(req, res) {
  const id = req.params.id;
  try {
    const result = await client.query('SELECT * FROM project WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Project not found');
    }
    res.render("project-detail", { project: result.rows[0] });
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
}

app.post('/project-delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await client.query('DELETE FROM project WHERE id = $1', [id]);
    res.redirect('/project');
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});
