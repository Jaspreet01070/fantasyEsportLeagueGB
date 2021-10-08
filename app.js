/*Take require packages and assign into variables*/
const express = require("express");
const bodyparser = require('body-parser');
const path = require("path");
const app = express();
const hbs = require("hbs");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { PlatformId, RiotAPI } = require('@fightmegg/riot-api');
const session = require("express-session");
const https = require('https');
const jsdom = require('jsdom');

const dom = new jsdom.JSDOM("");


const jquery = require('jquery')(dom.window);

const axios = require('axios');

require("./src/db/conn");
const Register = require("./src/models/registers");
var Contest = require('./src/models/contest-model');
const { json } = require("express");

var Players = require('./src/models/players');
const players = require("./src/models/players");
const { totalmem } = require("os");

// Run on the port 3001
const port = process.env.PORT || 3001;

// Making public12 folder static
const static_path = path.join(__dirname, "public");
const templates_path = path.join(__dirname, "templates/views");
const partials_path = path.join(__dirname, "templates/partials");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
//app.set("view engine", "hbs");
app.set("view engine", "ejs")
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}))

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.get("/forgotpassword", (req, res) => {
    res.render("forgotpassword");
});

// app.get("/login", (req, res) => {
//     res.render("SelectPlayers");
// });

//when user Click on Signup button perform this code
app.post('/registrationabcd', async (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const country = req.body.country
    const contactnumber = req.body.contactnumber
    const username = req.body.username
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword

    /*Validations for each and every field which is present in the Signup form*/
    const errors = {}
    if (firstname && !firstname.match(/^[a-zA-Z\s]*$/)) errors['firstname1'] = 'Firstname only contain letters'
    if (lastname && !lastname.match(/^[a-zA-Z\s]*$/)) errors['lastname1'] = 'Last name can only contain letters'
    if (email && !email.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/)) errors['email1'] = 'Enter valid email format'
    if (contactnumber && contactnumber.length != 10) errors['contactnumber2'] = 'Contact number should match with the exact length of 10 digits'
    if (contactnumber && !contactnumber.match(/^[0-9]*$/)) errors['contactnumber1'] = 'Contact number should be in numbers only'
    if (username && !username.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[@#*_]).{10,20}$/)) errors['username1'] = 'Username should contains atleast one upercase, one lowercase, one number and one special character from @/#/*/_. Size should be atleast 10 and lessthen 20 character'
    if (password && confirmpassword && !confirmpassword.match(password)) errors['password2'] = 'Password has to match'
    if (password && !password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[@#*_!]).{8,}$/)) errors['password1'] = 'Password should contains atleast one upercase, one lowercase, one number and one special character from @/#/*/_/!. Size should be atleast 8 character'
    const emailExists = await Register.findOne({ email: email });
    const userNameExists = await Register.findOne({ username: username })
    if (emailExists) errors['email'] = 'Email already exists'
    if (userNameExists) errors['username'] = 'Username already exists'

    // If errors object has more then 0 size
    if (Object.keys(errors).length > 0) {
        res.json({
            status: 'failed', data: {
                errors
            }
        })
    }
    // Else save the data into database
    else {
        let newNote = new Register({
            firstname,
            lastname,
            email,
            country,
            contactnumber,
            username,
            password,
            confirmpassword
        });

        newNote.save().then((res) => {
            console.log("RES:", res)
            //res.status(201).render("index");
        }).catch((error) => {
            console.log("ERROR:", error)
        });

        res.json({ status: 'success', data: 'Working' })

        // Send email to the user after successfully creating account
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gandhiridham19@gmail.com',
                pass: 'RIDHAM@1999        '
            }
        });

        var mailOptions = {
            from: 'gandhiridham19@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: `Hello,
    
                   you are recieving this email because you are successfully registered with Fantasy E-Sports League.
                  
                   Regards,
                   Ridham Gandhi`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
})

// login check
app.post("/login", async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });

        if (useremail.password === password) {
            req.session.email = email;
            res.status(201).redirect("/selectContest");
        } else {
            res.send("Invalid login details!!");
            // $('.alert-box').removeClass("hide");
            // $('body').addClass("alert-box-open");
            // $('.alert-box p').append("Invalid login details!!");
        }

    } catch (error) {
        res.status(400).send("Invalid login details!!");
    }
});

/**********************************************AUTOMATED TESTES FOR REGISTRATION***************************************************/

// Testing code
function EmptyCheck(fN) {

    if (fN == "") {
        return false;
    } else {
        return true;
    }

}
function onlyAlphabets(fN) {
    if (!/[^a-zA-Z]+/.test(fN)) {
        return true;
    } else {
        return false;
    }
}

function uniqueEmail(email1) {

    const email2 = Register.findOne({ email: email1 });

    //console.log(email2);

    if (email1 === email2) {
        return true;
    } else {
        return false;
    }
}
//[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_\.-]*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}+
//(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})/
///([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\@([A-Z]|[a-z]|[^<>()\[\]\\\/.,;:\s@"]){4,}\.(com|net)/
function emailFormat(emailFormat) {
    ///(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#_\$%\^&\*])(?=.{10,})/
    if (/([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\")@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})/.test(emailFormat)) {
        return true;
    } else {
        return false;
    }
}

function selectCountry(cname) {

    if (cname == "canada" || cname == "usa" || cname == "india" || cname == "uk") {
        return true;
    } else {
        return false;
    }
}

function contactLength(num) {
    if (num.length === 10) {
        return true;
    } else {
        return false;
    }
}

function contactContains(num1) {
    if (!/[0-9]+/.test(num1)) {
        return true;
    } else {
        return false;
    }
}

function uniqueUsername(uname) {
    const newuname = Register.findOne({ username: uname });
    if (newuname.username === uname) {
        return true;
    } else {
        return false;
    }
}

function usernameContains(uname) {
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#_\$%\^&\*])(?=.{10,})/.test(uname)) {
        return true;
    } else {
        return false;
    }
}

function usernameLength(uname) {
    if (uname.length < 10 || uname.length > 20) {
        return false;
    } else {
        return true;
    }
}

function passwordLength(pass) {
    if (pass.length >= 8) {
        return true;
    } else {
        return false;
    }
}

function passContainsAphabets(pass) {
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(pass)) {
        return true;
    } else {
        return false;
    }
}

function similarPassword(pass1, pass2) {
    if (pass1 === pass2) {
        return true;
    } else {
        return false;
    }
}

/**********************************************AUTOMATED TESTES FOR Login***************************************************/

function loginemail(Lemail) {
    const newemail = Register.findOne({ email: Lemail });

    if (Lemail.match(newemail)) {
        return true;
    } else {
        return false;
    }
}

function loginpassword(Lemail, Lpass) {
    const newemail = Register.findOne({ email: Lemail });

    if (newemail.password === Lpass) {
        return true;
    } else {
        return false;
    }
}


function addPlayers() {
    return 10;
}

module.exports = {
    EmptyCheck,
    onlyAlphabets,
    uniqueEmail,
    emailFormat,
    selectCountry,
    contactLength,
    contactContains,
    usernameContains,
    uniqueUsername,
    usernameLength,
    passwordLength,
    passContainsAphabets,
    similarPassword,
    loginemail,
    loginpassword,
    addPlayers
}


app.get("/selectPlayers",async (req,res)=>{



    var email = req.session.email;


    const user = await Register.findOne({email:email});

    // res.send(useremail.password);
    // console.log(useremail);
    // console.log(useremail.username);
    req.session.username = user.username;
    var username = req.session.username;
    console.log("username"+username);
    (async () =>{
        const rAPI = new RiotAPI('RGAPI-dbe58c30-43c0-4362-af27-482814a93f79');
        const summoner = await  rAPI.league.getGrandmasterByQueue({
            region: PlatformId.BR1,
            queue: "RANKED_SOLO_5x5"
        });
        /*--- for fetching object array from the actual object --- that is playersNames and there winning points---*/
        var players = [];
        var wins = [];
        summoner.entries.forEach((obj,i) =>
        {
            players[i] = summoner.entries[i].summonerName;
            wins[i] = summoner.entries[i].wins;
        });


//sending the retrieved data back into table file
        res.render('SelectPlayers',{data: {players:players,wins:wins,username:username}} );

    })().catch(e => {console.error(e)});

});


// sending player's data into collection => Players
app.post('/submitPlayers', (req, res) => {


    var username = req.session.username;
    var playerInfo = req.body.data;
    var Cid = req.body.id;
    console.log(Cid);

    let pName,
        pWins ,
        pSalary ,
        pCaptain ;

    playerInfo.forEach((obj,i)=>{

        pName = playerInfo[i]["selectedplayers"],
            pWins = playerInfo[i]["wins"],
            pSalary = playerInfo[i]["salary"],
            pCaptain = playerInfo[i]["teamcaptain"];

       // pName.substring(pName.indexOf('\n')+1,pName.indexOf('\n'));
        console.log(pCaptain);


        let myPlayers = new Players({
            players: pName,
            wins: pWins,
            salary:pSalary,
            captain: pCaptain,
            username:username,
            ContestID:Cid
        });

        // console.log(myPlayers);

        myPlayers.save()
            .then(doc=>{
                return res.status(201).send(doc)})
            .catch(err=>{
                return res.status(404).send(err)});
      });
});


// to the home page
app.get("/admin", (req, res) => {
    // res.sendFile(__dirname + "/public12/CreateContest.html");
    res.render("CreateContest");
});


// post the data
app.post("/admin", (req, res) => {

    let myContest = new Contest({
        cName: req.body.inputName,
        cPeriod: req.body.inputDate,
        cStatus: true
    });
    myContest.save()
        .then(doc => {
            return res.status(201).send(doc)
        })
        .catch(err => {
            return res.status(404).send(err)
        });
    res.redirect("/admin");
});

app.get('/players', async (req,res)=>{

    const rAPI = new RiotAPI('RGAPI-dbe58c30-43c0-4362-af27-482814a93f79');
    var result ;
    var config = {}
    var resp ={};
    var config1 = {}
    var resp1 = []
    const arr1 = ["Puyol", "Love", "Myangelpancha", "CAVALÃODOAMASS", "McDudu"];
    let arr2 = [];
    var res1 = [];
    let obj =[];
    let players = [];
    var summoner =[];
    var matches = [];
    var count=0;
    var assist = [];
    var total = 0;
    var kills =[] ;
    var deaths = [];

    for (const obj1 of arr1) {
         let j = arr1.indexOf(obj1);
    //

        result = await rAPI.summoner.getBySummonerName(
            {
                region: PlatformId.BR1,
                summonerName: arr1[j]
            });

        console.log(result.puuid);
        const config = {
            url: `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${result.puuid}/ids?start=0&count=20`,
            headers: {
                "X-Riot-Token": "RGAPI-dbe58c30-43c0-4362-af27-482814a93f79"
            },
            method: 'GET'
        };

        resp = await axios(config);
        console.log(resp.data[0]);

        const config1 = {

            url: `https://americas.api.riotgames.com/lol/match/v5/matches/${resp.data[1]}`,
            headers: {
                "X-Riot-Token": "RGAPI-dbe58c30-43c0-4362-af27-482814a93f79"
            },
            method: 'GET'
        };

        resp = await axios(config1);
        // console.log(resp.data[0]);

        resp.data.info.participants.forEach((obj, i) => {
            //console.log(resp.data.info.participants[i].puuid);
            //console.log("============================"+ players.length);
            if (resp.data.info.participants[i].puuid === result.puuid) {

                // console.log(resp.data.info.participants[i].puuid);
                // console.log("ndjkfngkjfdngkjfdkj============");
                assist.push(resp.data.info.participants[i].assists);
                 kills.push(resp.data.info.participants[i].kills);
                deaths.push( resp.data.info.participants[i].deaths);
                // var turretKills = resp.data.info.participants[i].turretKills;
                // var dragonKills = resp.data.info.participants[i].dragonKills;
                // var baronKills = resp.data.info.participants[i].baronKills;
                // var win = resp.data.info.participants[i].win;
//                total = assist * 4 + kills * 6 + turretKills * 2 + dragonKills * 4 + baronKills * 6 - deaths * 2

                // let obj = {assist,kills,deaths,turretKills,dragonKills,win,total,arr1};
                //  res1[i].push(obj);


                // Promise.all([assist,kills,deaths,turretKills,dragonKills,win,total]).then(values => {
                //    // obj.push(values);
                //     console.log(values);
                //   });



                // console.log("Death:  " + deaths)
                // console.log("Turtle Kill:  " + turretKills)
                // console.log("Dragon Kill:  " + dragonKills)
                // console.log("Baron Kill:  " + baronKills)
                // console.log("Win :  " + win)

             //   console.log("Total Player Score: " + total)


            }

        });
        // for (var p =0;p<assist.length;p++){
        //     console.log("Assist:  " + assist[p]);
        //     console.log("Kill:  " + kills[p]);
        // }
    }

    res.render('scores', {data:{assist:assist, kills:kills, deaths:deaths} });

});

// to the home page
app.get("/selectContest", async(req, res) => {

    var email = req.session.email;


    const user = await Register.findOne({email:email});

    // res.send(useremail.password);
    // console.log(useremail);
    // console.log(useremail.username);
    req.session.username = user.username;
    var username = req.session.username;
    console.log("username"+username);

    Contest.find({}, function (err, contests) {
        res.render('SelectContest', {
            contestsList: contests,
            username: username
        });
    });
});

// put the data
app.put("/Auto/:id",(req,res)=>{
    // get json object from request body
    const body = req.body;
    if (!body) {
        return res
            .status(400)
            .json({success: false, error: "You must provide some data to update"});
    }

    // find the document in the database
    Contest.findOne({_id: req.params.id}, (err, contest) => {
        if (err) {
            return res
                .status(400)
                //.json({err, message: "Album item not found."})
                .json({success: false, error: err})
        }
        if (!contest) {
            return res
                .status(404)
                .json({err, message: "Contest item not found."})
        }
        // update the document with the json data that was passed in req.body
        contest.cName = body.cName;
        contest.cPeriod = body.cPeriod;
        contest.cStatus = false;

        // save the updated object back to the database
        contest
            .save()
            .then(() => {
                return res
                    .status(200)
                    .json({
                        success: true,
                        id: contest._id,
                        message: "Contest updated."
                    })
            })
            .catch(error => {
                return res
                    .status(404)
                    .json({error, message: "Contest not updated"})
            });
    });
});


// post the data
app.post("/Auto", (req, res) => {

    let myContestAuto = new Contest({
        cName: req.body.cName,
        cPeriod: req.body.cPeriod,
        cStatus: true
    });
    myContestAuto.save()
        .then(doc=>{
            return res.status(201)
                .send(console.log(doc))})
        //.json({success: true, message:"Contest created."})})
        .catch(err=>{
            return res.status(404)
                .send(console.log(err))});
    //.json({success: false, error: err})});
    res.redirect("/Auto");
});

// Automatic creat and delete the league

const schedule = require('node-schedule')
// const axios = require('axios')

schedule.scheduleJob('55 11 * * 4',()=>{

    console.log("running")

    //delete the myContest

    const myContest3 = new Contest({
        cName: "auto creation",
        cPeriod: "2021-10-07T02:49:00.029+00:00",
        cStatus: false
    })
    axios.put("http://localhost:3001/Auto/615e601ca50351062eadfb33",myContest3).then(res => {
        console.log(res.data);
        console.log(res.status);
    }).catch(err=>{
        console.log(err);
    })

    //create the myContest

    const myContest2 = new Contest({
        cName: "auto creation",
        cPeriod: new Date(),
        cStatus: true
    })
    axios.post("http://localhost:3001/Auto",myContest2).then(res => {
        myContest2.save()
            .then(doc=>{console.log("success")})
            .catch(err=>{console.log(err)});
        console.log(res.status);
    }).catch(err=>{
        console.log(err);
    })

    console.log("ending")
});


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})