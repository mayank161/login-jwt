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

        bcrypt.hash(password,12,async function(err, hash) {
            const u = await new user({
                name: name,
                email: email,
                password: hash,
                resetToken: null
            })
            u.save();

            const msg = {
                from:'satimayank94@gmail.com',
                to: email,
                subject: 'sending mail',
                text: 'mail sent successfully',
                html:`thanks ${name} for signup we will be in touch`
            }
            
            const z = await transport.sendMail(msg,async function(err,data) {
                if(err) { 
                    return res.json({messagae:'no'})
                 }

            })
            const token = await jwt.sign({id: u.id, email: email},process.env.ACCESS_TOKEN_SECRET);
            console.log(req.body.email,req.body.password);
            res.json({token:token})
        })       
    } catch (error) {
        console.log(error);
        res.status(401);
    }
}

// login automatically when jwt token present
exports.login = async (req,res,next) => {
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
                   if(err) { return res.json({message:'not'}); }
                   else { 
                       console.log('hiiiiiiiiiiii',data);
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
    const token = req.params.token;
    console.log(token);
    res.status(200).send(`<html>
    <script>
        function formsubmitted(e){
            e.preventDefault();
            console.log('called')
        }
    </script>
    <form action="/updatepassword/${token}" method="get">
        <label for="newpassword">Enter New password</label>
        <input name="newpassword" type="password" required></input>
        <button>reset password</button>
    </form>
</html>`
)
res.end();
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
                   return res.status(200).send('<h1>password reset successfully</h1>')
                }
            })

        })
    } catch (error) {
        return res.status(403).json({ error})
    }
}