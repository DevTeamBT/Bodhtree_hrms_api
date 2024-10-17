const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./router/routerLogin/userRoute'); 
const projectRoutes = require('./router/routerProject/projectRouter');
const taskRouter = require('./router/routerProject/pTaskRouter');
const comment = require('./router/routerProject/tCommentRouter');
const password = require('./router/routerLogin/passwordRoute');
const country = require('./router/routerCountry/countryRouter');
const Client = require('./router/routerClient/clientRouter');
const ClientReq = require('./router/routerClient/clientReqRouter');
const Attendance = require('./router/routerLogin/attendenceRouter');
const uplodePdf = require('./router/routerLogin/uplodePdf');
// const cors = require('cors');
const auth = require('./router/authRouter/authRouter');

const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Use cookie-parser middleware
app.use(cookieParser());

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://madabhavipriyanka62:venwkNcLMK3gjCOr@cluster0.0n9xq0f.mongodb.net/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin, e.g., mobile apps or curl requests
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = ['http://127.0.0.1:5504', 'http://172.16.2.6:8000', 'http://172.16.2.4:8000', 'http://127.0.0.1:5500'];

    // Check if the request's origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Allow origin
    } else {
      callback(new Error('Not allowed by CORS')); // Block origin
    }
  },
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'], // Allowed headers
};

// Use the CORS middleware
app.use(cors(corsOptions));

// Preflight request handler for OPTIONS method
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin); // Dynamically set the allowed origin
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization', 'credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200); // Send a 200 status code to indicate success
});




// Use the userRoutes for handling user-related routes
app.use(userRoutes);
app.use(projectRoutes);
app.use(taskRouter);
app.use(comment);
app.use(auth);
app.use(password);
app.use(country);
app.use(Client);
app.use(ClientReq);
app.use(Attendance);
app.use(uplodePdf);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
