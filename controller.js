const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user:'satimayank94@gmail.com',
        pass:'szhiusvqsmaqoiaf'
    }
})

const user = require('./data/usermodel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// signup require one type
exports.signup = async(req,res,next) => {
    try {
        
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const USER = await user.findOne({email: email}).then((email) => {return email}).catch(err => console.log(err))
        if(USER) {
            return res.json({message:"401"});
        }

        const str = ''+name +','+email+','+password;

        const msg = {
            from:'satimayank94@gmail.com',
            to: email,
            subject: 'sending mail',
            text: 'mail sent successfully',
            html:`<body style="background-color: blueviolet; color: white;">
            <div style=" margin: 2%;">
            thanks ${name} for signup please click the button below to verify your account
            </div>
            <div style=" margin: 2%;">
            <a href="http://localhost:3000/verify/${str}" style="padding: 10px 20px; background-color: coral; border: 2px solid black;"> click </a>
            </div>
            </body>`
        }
            
        const z = await transport.sendMail(msg,async function(err,data) {
            if(err) { 
                return res.json({message:'no'})
            }
            res.json({message: 'yes'});
        })       
    } catch (error) {
        console.log(error);
        res.status(401);
    }
}



exports.verified = (req,res,next) => {
    try {
        const str = req.params.entry;
        const arr = str.split(',');
        
        bcrypt.hash(arr[2],12,async function(err, hash) {
            const u = await new user({
                name: arr[0],
                email: arr[1],
                password: hash,
                resetToken: null
            })
            u.save();
            
            res.redirect('/');
            // const token = await jwt.sign({id: u.id, email: email},process.env.ACCESS_TOKEN_SECRET);
            // console.log(req.body.email,req.body.password);
            // res.json({token:token})
        })
    } catch (error) {
        console.log(error);
        res.status(401);
    }
}


// login automatically when jwt token present
exports.jwt = async (req,res,next) => {
    try {
        const token = await req.header("Authorization");
        const u = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      
        if(u.id) { 
            console.log(u)
            res.status(200).json({message:'ok'})
        }
    } catch (error) {
        console.log(error)
    }
    
}

// pass the mail containing token n params
exports.forget =(req,res,next) => {
    try {
        const email = req.body.email;
            crypto.randomBytes(10,(err, buffer) => {
                if(err) { throw new Error(err); }
               const token = buffer.toString('hex');
            
               user.findOneAndUpdate({email:email},{resetToken: token},{userFindAndModify: false}, (err,data) => {
                   if(err || !data) { return res.json({message:'not'}); }
                   else { 
                       const msg = {
                        from:'satimayank94@gmail.com',
                        to: email,
                        subject: 'sending mail',
                        text: 'mail sent successfully',
                        html:`<h1> please click the link to reset your password<a href="http://localhost:3000/reset/${token}">click</a> </h1>`
                    }
                
                    transport.sendMail(msg,function(err,data) {
                        if(err) { throw new Error(err) }
                        else { res.json({message:'ok'}) }
                    })
                    }
               })
        })
    } catch (error) {
        console.log(error);
        res.status(401)
    }
}

// link passed by mail
exports.resetPass = (req,res,next) => {
    try {
        const token = req.params.token;
        console.log(token);
        user.findOne({resetToken:token}).then(val => {
            if(!val) { return res.send(`<body>
                <a  href="http://localhost:3000"  style="padding: 10px 20px; background-color: coral; border: 2px solid black;">home</a>
                <div style= "margin: 3%;"> 
                <h1> token expires </h1>
                </div>
                `)}
            else {
                res.status(200).send(`<html>
                <body>
                <a  href="http://localhost:3000"  style="padding: 10px 20px; background-color: coral; border: 2px solid black;">home</a>
                <div style= "margin: 3%;">
                <form action="/updatepassword/${token}" method="get">
                    <label for="newpassword">Enter New password</label>
                    <input name="newpassword" type="password" required></input>
                    <button>reset password</button>
                </form>
                </div>
                </body>
            </html>`
            )}
            res.end();
        }).catch (err => {throw new Error(err)})
    } catch (error) {
        console.log(error)
        res.status(401);
    }
}


// write new password
exports.newPass = async(req,res,next) => {
    try {
        const {newpassword} = req.query 
        const {token} = req.params

        bcrypt.hash(newpassword, 12, function(err, hash) {
            console.log(hash,'fhsjdhfjksfjkdsfjkdsfkjds')
            if(err){
                console.log(err);
                throw new Error(err);
            }

            user.findOneAndUpdate({resetToken:token},{password: hash,resetToken: null},{userFindAndModify: false}, (err,data) => {
                if(err) { throw new Error(err) }
                else {
                   return res.status(200).send(`
                   <a  href="http://localhost:3000"  style="padding: 10px 20px; background-color: coral; border: 2px solid black;">home</a>
                   <h1>password reset successfully</h1>`)
                }
            })

        })
    } catch (error) {
        return res.status(403).json({ error})
    }
}


exports.logout = async(req,res,next) => {
    try {
        const token = await req.header("Authorization");
        console.log('hiiiiiiiiiiiiiiii',token);
        const u = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        console.log(u.id);
        user.deleteOne({_id:u.id}).then(() => {
            console.log('user deleted')
            return res.json({message: 'yes'})
        })
        .catch(err => {throw new Error(err); })
    } catch (error) {
        console.log(error);
        res.status(401)
    }
    
}


exports.login = async (req,res,next) => {
    try {
        const email = req.body.email
        const password = req.body.password
    
        const u = await user.findOne({email:email})
        if(!u) { return res.json({token: 'no'})}
    
        bcrypt.compare(password,u.password, async (err,hash) => {
            if(err) { throw new Error(err); }
            if(hash) {
                const token = await jwt.sign({id: u.id, email: email},process.env.ACCESS_TOKEN_SECRET);
                res.json({token:token})
            }
            else { res.json({token:'no'})}
        })
    } catch (error) {
        console.log(error);
    }
}