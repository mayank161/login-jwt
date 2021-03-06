const  controller = require('./controller')
const path = require('path');
const staticPath = path.join(__dirname,"./views")

const port = process.env.PORT || 3000;

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
app.get('/verify/:entry',controller.verified);

app.get('/deleteAccount',controller.logout)
app.get('/test', (req,res) => { res.json({hello:'hello world'})})
app.listen(port);