const  controller = require('./controller')
const express = require('express');
const app = express();
const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/test",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.connection.on('connected',() => { console.log('connect')})
.on('error', error => { console.log(error)})

require('dotenv').config()

const cors = require('cors');
app.use(cors());

app.use(express.json());


app.post('/signup',controller.signup)
app.get('/jwt',controller.login)
app.post('/forgetPass',controller.forget)
app.get('/reset/:token',controller.resetPass)
app.get('/updatepassword/:token',controller.newPass)
app.listen(3000);