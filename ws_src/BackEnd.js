const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const port = 4006;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../ws_src')));

//CORS
var cors = require('cors');
app.use(cors());

let corsOptions = {
    origin: 'http://localhost:4005',
    methods: 'GET,POST,PUT,DELETE'
}

app.use(cors(corsOptions));

// Database Connection
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'group9',
    password: 'group9',
    database: 'g9database',
    port: 3306
});

connection.connect(function (err) {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log(`Connected to DB`);
});

//Sample Data
app.post('/api/sample', (req, res) => {
  const { username, password, meanHold, stdHold, meanFlight, stdFlight } = req.body;
  
  const sql1 = "SELECT * FROM User WHERE Username = ?";
  connection.query(sql1, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.length > 0) {
      return res.json({ success: false, message: 'Username already exists' });
    }
    
    const sql = "INSERT INTO User (Username, Password, Mean_HTime, Std_HTime, Mean_FTime, Std_FTime) VALUES (?, ?, ?, ?, ?, ?)";
    
    connection.query(sql, [username, password, meanHold, stdHold, meanFlight, stdFlight], (err, results) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      console.log('Successfully:', {
        username,
        meanHold: meanHold.toFixed(2),
        stdHold: stdHold.toFixed(2),
        meanFlight: meanFlight.toFixed(2),
        stdFlight: stdFlight.toFixed(2)
      });
      
      res.json({ success: true, message: 'Successfully' });
    });
  });
});

//Authentication
app.post('/api/login', (req, res) => {
  const { username, password, meanHold, stdHold, meanFlight, stdFlight } = req.body;
  
  const sql = "SELECT * FROM User WHERE Username = ?";
  
  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
    
    const user = results[0];
    
    if (user.Password !== password) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
    
    console.log('Password correct');
    
    const dbMeanHold = parseFloat(user.Mean_HTime);
    const dbStdHold = parseFloat(user.Std_HTime);
    const dbMeanFlight = parseFloat(user.Mean_FTime);
    const dbStdFlight = parseFloat(user.Std_FTime);
    
    function calculateMatchScore(observed, referenceMean, referenceStd) {
      if (referenceStd < 0.01) return 0;
      const zScore = Math.abs(observed - referenceMean) / referenceStd;
      return Math.min(zScore, 5);
    }
    
    const holdScore = calculateMatchScore(meanHold, dbMeanHold, dbStdHold);
    const flightScore = calculateMatchScore(meanFlight, dbMeanFlight, dbStdFlight);
    
    const thresholdHold = 2.0;  
    const thresholdFlight = 2.0;
    
    const isHoldMatch = holdScore <= thresholdHold;
    const isFlightMatch = flightScore <= thresholdFlight;

    const combinedScore = (holdScore + flightScore) / 2;
    const maxCombinedScore = 1.5;
    const isAuthenticated = isHoldMatch && isFlightMatch && combinedScore <= maxCombinedScore;
    
    if (isAuthenticated) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ 
        success: false, 
        message: 'Typing pattern does not match profile',
      });
    }
  });
});

app.listen(port, function () {
    console.log("Server listening at Port " + port);
});

