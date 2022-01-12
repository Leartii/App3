require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const req = require('express/lib/request');
const { rawListeners } = require('process');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const options = {
  family: 4,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended : false}))
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use((req,res,next) => {
  if(isURL(req.body.url)){ 
    console.log(typeof req.body.url)
    console.log(req.body.url);
    let url = req.body.url.replace("https://","");
    console.log("test url : "+url);
    dns.lookup(url, (err, address, family) => {
      if(err){
        console.log("Error"+err);
        next();
      } else {
        console.log
        req.body.urlshort = address;
        next();
      }
    })
  } else {
    req.body.urlshort = 'invalid url'
    next();
  }
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', (req,res) => {
    if(req.body.urlshort === "invalid url"){
      res.json({error : "invalid url"});
    } else{ 
      res.json({original_url : req.body.url, short_url : req.body.urlshort});
    }
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