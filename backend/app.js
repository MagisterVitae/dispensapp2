const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const secrets = require('./secrets.ignore');

const catalogRoutes = require('./routes/catalog');
const storageRoutes = require('./routes/storage');

const app = express();

mongoose.connect(secrets.mongoUrl)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas! Check Atlas IP whitelist first');
        console.error(error);
    })

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/api/catalog', catalogRoutes);
app.use('/api/storage', storageRoutes);

module.exports = app;