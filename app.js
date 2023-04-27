require('dotenv').config()
const mailchimp = require("@mailchimp/mailchimp_marketing");
const express = require("express");
const app = express();

app.use(express.urlencoded({extended:true})); //body-parser alt contd.

app.use(express.static(__dirname));

mailchimp.setConfig({
    apiKey: process.env.API_KEY,
    server: "us21",
});
  
async function runCheck() {
    const response = await mailchimp.ping.get();
    console.log(response);
}
runCheck();

app.get("/", (req, res) =>{
    res.sendFile(__dirname+"/signup.html");
})

app.post("/", (req, res) =>{
    let fName = req.body.firstName;
    let lName = req.body.lastName;
    let e_mail = req.body.email;

    const listId = process.env.LIST_ID;
    const subscribingUser = {
        firstName: fName,
        lastName: lName,
        email: e_mail
    };

    async function run() {
        try{
                const response = await mailchimp.lists.addListMember(listId, {
                email_address: subscribingUser.email,
                status: "subscribed",
                merge_fields: {
                    FNAME: subscribingUser.firstName,
                    LNAME: subscribingUser.lastName
                }
                });

                res.sendFile(__dirname+"/success.html");
                
                console.log(
                    `Successfully added contact as an audience member. The contact's id is ${
                        response.id
                    }.`
                );
        }
        catch(e)
        {
            console.log("====== ERROR ======");
            res.sendFile(__dirname+"/failure.html");
        }
    }
    run();
});

app.post("/failure", (req, res) =>{
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening on port 3000");
})