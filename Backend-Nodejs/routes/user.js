const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config()

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole')
router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')"
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: 'Successfully Registered' });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Email Already Exist" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
});

router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect Username or password" });
            }
            else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Wait for Admin Approval" })
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ message: accessToken })
            }
            else {
                return res.status(400).json({ message: "Something Went Wrong!!" })
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'yopmail',
    auth: {
        user: process.env.EMAIL,
        password: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email,password from user where email=?",
        connection.query(query, [user.email], (err, results) => {
            if (!err) {
                if (results.length <= 0) {
                    return res.status(200).json({ message: "PAssword Sent Successfully" });
                }

                else {
                    var mailOptions = {
                        from: process.env.EMAIL,
                        to: results[0].email,
                        subject: 'Password by CAFE MANAGEMENT SYSTEM',
                        html: '<p><b>Your login details for cafe management System </b><br><b>Email:</b>'+results[0].email+'<br><b>Password:</b>'+results[0].password+'<p>'
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error)
                        }
                        else {
                            console.log('Email Sent:' + info.response)
                        }
                    });

                    return res.status(200).json({ message: "PAssword Sent Successfully" });
                }
            }
            else {
                return res.status(500).json(err)
            }
        })
})

router.get('/get',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    var query = "select id,name,email,contactNumber,status from user where role='user'";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }
        else{
            return res.status(500).json(err)
        }
        
    })
})

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let user = req.body;
    var query  = "update user set status=? where id=?";
    connection.query(query,[user.status,user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"user id doesnt exist"}) 
            }
            return res.status(200).json({message:"user updated succesfully"});
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.get('/checkToken',auth.authenticateToken,(req,res)=>{
    return res.status(200).json({message:"true"});
})

router.post('/changePassword',auth.authenticateToken,(req,res)=>{
   const user = req.body;
   const email = res.locals.email;
   var query = "select *from user where email=? and password=?";
   connection.query(query,[email,user.oldPassword],(err,results)=>{
    if(!err){
        if(results.length<=0){
            return res.status(400).json({message:"Incorrect old pwd"});
        }
        else if(results[0].password == user.oldPassword){
            query = "update user set password=? where email=?";
            connection.query(query,[user.newPassword,email],(err,results)=>{
                if(!err){
                    return res.status(200).json({message:"Password Updated Successfully"});
                }
                else{
                    return res.status(500).json(err);
                }
            })
            
        }
        else {
            return res.status(400).json({message:"Something went wrong!"})
        }
    }
    else{
        return res.status(500).json(err)
    }
   }) 
})

module.exports = router;