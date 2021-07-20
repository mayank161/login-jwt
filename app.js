const  controller = require('./controller')
const path = require('path');
const staticPath = path.join(__dirname,"./views")

const express = require('express');
const app = express();
app.use(express.static(staticPath));

const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/test",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.connection.on('connected',() => { console.log('connect')})
.on('error', error => { console.log(error)})

require('dotenv').config()

const cors = require('cors');
app.use(cors());

app.use(express.json());


app.post('/signup',controller.signup)
app.get('/jwt',controller.jwt)
app.post('/forgetPass',controller.forget)
app.get('/reset/:token',controller.resetPass)
app.get('/updatepassword/:token',controller.newPass)
app.post('/login',controller.login);

app.get('/deleteAccount',controller.logout)
app.listen(3000);