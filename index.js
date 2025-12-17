import hbs from 'hbs';
import express from 'express';
import { Client } from 'pg';
import multer from 'multer';
import bcrypt from 'bcrypt';
import flash from 'express-flash';
import session from 'express-session';
 
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
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))
app.use(flash());
hbs.registerHelper('includes', function (array, value) {
  if (!array) return false;
  return array.includes(value);
});
hbs.registerHelper('formatDate', function (date) {
  return new Date(date).toISOString().split('T')[0];
});

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', home);
app.get('/project',project);
app.post('/project', upload.single('image'), handleproject);
app.get('/project-detail/:id', projectdetail);
app.get('/project-edit/:id', projectedit);
app.post('/project-edit/:id', upload.single('image'), handleprojectedit);
app.get('/login', login);
app.post('/login', handlelogin);
app.get('/register', register);
app.post('/register', handleregister);
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function home(req, res) {
  let userdata;
  if (req.session.user) {
    userdata = req.session.user;
  }
  res.render("index", { userdata });
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

async function projectedit(req, res) {
  const id = req.params.id;

  try {
    const result = await client.query(
      'SELECT * FROM project WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Project not found');
    }

    const project = result.rows[0];
    // Format dates suitable for input fields
    project.startdate = project.startdate.toISOString().split('T')[0];
    project.enddate = project.enddate.toISOString().split('T')[0];
    // Convert technologies string to array
    project.technologies = project.technologies
      ? project.technologies.split(', ')
      : [];
    // Render edit form with project data
    res.render('project-edit', {
      project,
      techList: ['NodeJs', 'NextJs', 'ReactJs', 'TypeScript']
    });

  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
}


async function handleprojectedit(req, res) {
  const id = req.params.id;
  let { projectname, startdate, enddate, description, technologies } = req.body;

  // Handle technologies as array
  if (!Array.isArray(technologies)) {
    technologies = technologies ? [technologies] : [];
  }
  const techString = technologies.join(', ');

  try {
    // Get old image if no new image is uploaded
    const oldData = await client.query(
      'SELECT image FROM project WHERE id = $1',
      [id]
    );

    if (oldData.rows.length === 0) {
      return res.status(404).send('Project not found');
    }

    const imageBuffer = req.file
      ? req.file.buffer
      : oldData.rows[0].image;

    await client.query(
      `UPDATE project
       SET projectname = $1,
           startdate = $2,
           enddate = $3,
           description = $4,
           technologies = $5,
           image = $6
       WHERE id = $7`,
      [
        projectname,
        startdate,
        enddate,
        description,
        techString,
        imageBuffer,
        id
      ]
    );

    res.redirect('/project');

  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
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

async function login(req, res) {
  res.render("login", { messages: req.flash('error') });
}

 async function register(req, res) {
  res.render("register", { messages: req.flash('error') });
}

async function handleregister(req, res) {
  let { username, email, password } = req.body;
  const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    req.flash('error', 'Email already registered');
    return res.redirect('/register');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
}

async function handlelogin(req, res) {
  let { email, password } = req.body;
  const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    req.flash('error', 'Invalid email or password');
    return res.redirect('/login');
  }
  const user = userResult.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    req.flash('error', 'Invalid email or password');
    return res.redirect('/login');
  }
  req.session.user = user.username;
  res.redirect('/');
}

