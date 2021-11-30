const path = require('path');
const express = require('express');
const cors = require("cors");

const app = express();
// Set static folder
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());
app.use(cors());

let smartWatch = {
    starttime: 0,
    color: "rgb(0, 0, 0)",
    gps: {w: 49.90425, l: 18.02937},
    alerts: [{time: '7:00', message: 'Snídaně'}, {time: '13:00', message: 'Oběd'}, {time: '18:00', message: 'Večeře'}],
    getDate: function() {
        return (new Date()).toLocaleDateString();
    },
    getTime: function() {
        return (new Date()).toLocaleTimeString();
    },
    setColor: function(r, g, b) {
        this.color = `rgb(${r},${g},${b})`;
    },
    setGPS: function(width, length) {
        this.gps.w = width;
        this.gps.l = length;
    },
    addAlert: function(time, message) {
        this.alerts.push({time: time, message: message})
    },
    getAlert: function(time) {
        data = this.alerts.filter((value) => value.time == time);
        return data;
    }
}

app.get('/api/server/name', (req, res) => {
    res.send('Server PES 1.0');
});

app.get('/api/watch', (req, res) => {        
    res.send(JSON.stringify(smartWatch));
});

app.get('/api/time', (req, res) => {
    res.send(smartWatch.getTime());
});

app.get('/api/date', (req, res) => {
    res.send(smartWatch.getDate());
});

app.get('/api/color', (req, res) => {
    res.send(smartWatch.color);
});

app.get('/api/gps', (req, res) => {
    res.send(smartWatch.gps);
});

app.get('/api/alerts', (req, res) => {
    if (req.query.time) {
       res.send(smartWatch.getAlert(req.query.time)); 
    } else {
       res.send(smartWatch.alerts);  
    }
});

app.post('/api/color', (req, res) => {
    let data = req.body;
    smartWatch.setColor(data.red, data.green, data.blue);
    res.send('');
});

app.post('/api/gps', (req, res) => {
    let data = req.body;
    smartWatch.setGPS(data.lat, data.lng);
    res.send('');
});

app.post('/api/alerts', (req, res) => {
    let data = req.body;
    smartWatch.addAlert(data.time, data.message);
    res.send(smartWatch.alerts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));