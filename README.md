# images to demonstrate the product
1. first you have to install all the dependecy in node_modules by using npm i
2. and after that do (npm start) to run the server
# 3. dependency contains bcrypt, cors, dotenv, express, jsonwebtoken, nodemailer, pg, pg-hstore, sequelize

4.front page look like
<img src="img/1.PNG">

5.if providing invalid email that is not exist then nodemailer gives invalid
<img src="img/2.PNG">

6.if provide corect then nodemailer accept
<img src="img/3.PNG">

# note when you open page again you will note see the login page because you are already logged in using jwt so i am just clearing the local storage so can loggin again for demo.

7.if again provide same email then database model findOne email
<img src="img/4.PNG">

8. if press forget password and then provid invalid email again nodemailer check it
<img src="img/5.PNG">

9.if provide corect then you have to check your email and click the link
<img src="img/6.PNG">
<img src="img/7.PNG">

10. then enter new password and paswoord changes with the help of hash runtime token
<img src="img/8.PNG">
<img src="img/9.PNG">

11. and when you start your page again then you are already logged in by jwt authentication
