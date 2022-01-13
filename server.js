require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const req = require('express/lib/request');
const { rawListeners } = require('process');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
let webschema = new Schema({
  short_url : { type : String , unique : true, required : true, dropDups: true },
  original_url : { type : String , unique : true, required : true, dropDups: true }
})
let addr = mongoose.model('addr',webschema);

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended : false}))
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.set("trust proxy", 1);


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', (req,res,next) => {
  if(isURL(req.body.url)){ 
    let url = req.body.url.replace("https://","");
    console.log("test url : "+url);
    dns.lookup(url, (err, address, family) => {
      if(err){
        console.log("Error"+err);
        next();
      } else {
        req.body.urlshort = address;
        let web = new addr({short_url : address, original_url : req.body.url});
        web.save((err,data) => {
          if(err) console.log("Error occurred"+err);
          console.log("Successfully saved data"+data);
        })
        next();
      }
    })
  } else {
    req.body.urlshort = 'invalid url'
    next();
  }}, (req,res) => {
    if(req.body.urlshort === "invalid url"){
      res.json({error : "invalid url"});
    } else{ 
      res.json({original_url : req.body.url, short_url : req.body.urlshort});
    }
})

app.get("/api/shorturl/:id?", (req,res) => {
  addr.findOne({short_url : req.params.id}, (err, address) => {
      if(err){
        console.log("address not found");
        res.json({error : "Invalid ip"});
      }
      else{
        let obj = address;
        console.log("Found"+address + obj);
        console.log("Type of address : "+typeof address+"/n shorturl : " + address.short_url);
        console.log("https://"+address.original_url);
        res.redirect(address.original_url);
      }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}
function validateIPaddress(ipaddress) {  
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
    return (true)  
  }  
  return (false)  
}  