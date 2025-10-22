const { timeStamp } = require('console');
const axios = require('axios');
const express = require('express');
const path = require('path');
const port = 4005;
const app = express();
const router = express.Router();

app.use(router);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../fe_src')));

//Login Page
router.get('/Login', (req, res) => {
    console.log(`Request at ${req.path}`);
    res.sendFile(path.join(`${__dirname}/html/login.html`));
    }
)

//Sample Page
router.get('/Sample', (req, res) => {
    console.log(`Request at ${req.path}`);
    res.sendFile(path.join(`${__dirname}/html/sample.html`));
    }
)

//Login Success Page
router.get('/Hi', (req, res) => {
    console.log(`Request at ${req.path}`);
    res.sendFile(path.join(`${__dirname}/html/success.html`));
    }
)

//Login Fail Page
router.get('/Fail', (req, res) => {
    console.log(`Request at ${req.path}`);
    res.sendFile(path.join(`${__dirname}/html/fail.html`));
    }
)

//Sample Data Page
router.post('/Sample', async function (req, res) {
    const { username, password, meanHold, stdHold, meanFlight, stdFlight} = req.body;

    try {
        const response = await axios.post('http://localhost:4006/api/sample', {
            username,
            password,
            meanHold,
            stdHold,
            meanFlight,
            stdFlight
        });
        res.json(response.data);
        if (response.data.success) {
            console.log('Success');
        } else {
            console.log('Fail: ', response.data.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

//Get username, password then send to backend
router.post("/form-submit", async function (req, res) {
    const { username, password, meanHold, stdHold, meanFlight, stdFlight} = req.body;

    try {
        const response = await axios.post('http://localhost:4006/api/login', {
            username,
            password,
            meanHold,
            stdHold,
            meanFlight,
            stdFlight
        });
        res.json(response.data);
        if (response.data.success) {
            console.log(`${username} Success`);
        } else {
            console.log('Fail: ', response.data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/Login');
    }
});

app.listen(port, function () {
    console.log("Server listening at Port " + port);
});
