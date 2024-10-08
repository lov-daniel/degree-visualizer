  // Package Imports
  import express from 'express';
  import path from 'path';
  import multer from 'multer';
  import cors from 'cors';
  import * as pdfjs from 'pdfjs-dist';
  import { fileURLToPath } from 'url';

  // Script Imports
  import Process_Transcript from './transcript.js';
  import Load_Classes from './classes.js';


  // CommonJS work arounds
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Creating server instance
  const app = express();

  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(express.json());  
  app.use(cors());

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      return cb(null, "./public/Images")
    },
    filename: function(req, file, cb) {
      return cb(null, `${Date.now()}_${file.originalname}`)
    }
  })

  const upload = multer({storage})
  
  // req.isAuthenticated is provided from the auth router
  app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

  app.get('/update-classes', async (req, res) => {

    try {

      let scrapped = await Load_Classes();

      res.json(scrapped);
    } catch (error) {
      console.error("Error while scrapping: " + error);
    }

  });

  app.post('/upload', upload.single('file'), async (req, res) => {
    // Send a response back to the client
    res.json({ message: 'Upload successful' });
    const filePath = req.file.path;

    try {
      const document = await pdfjs.getDocument(filePath).promise; 
      let results = await Process_Transcript(document);

      console.log("Total quarters: ");
      console.log(results);
      

    } catch (error) {
      console.error("error: ", error);
    }
    

  });

  // Starts server instnace
  const port = 8080; // Use environment variable for port
  app.listen(port, () => console.log(`Server listening on port ${port}`));