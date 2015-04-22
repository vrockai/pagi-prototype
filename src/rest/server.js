// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var faker      = require('faker');

// Proposed size of db to be a random integer from <100, 150>
var dbSize = Math.floor(Math.random() * (150 - 100 + 1)) + 100;
var dbMock = {people: []};

function populateDb(){
  console.log('DB size: ', dbSize);

  for(var i = 0; i < dbSize; i++) {
    var person = {
      id: i,
      name: faker.name.findName(),
      email: faker.internet.email(),
      date: faker.date.past(),
      avatar: faker.image.avatar()
    };
    dbMock.people.push(person);
  }
}

populateDb();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Hello world!' });
});

// ?page=2&per_page=100

router.get('/data', function(req, res) {

  var page = req.query.page ? parseInt(req.query.page) : 0;
  var perPage = req.query.per_page ? parseInt(req.query.per_page) : 10;
  var lastPage = Math.floor((dbMock.people.length - (dbMock.people.length % perPage)) / perPage);

  var offset = page * perPage;
  var result = dbMock.people.slice(offset, offset + perPage);

  // Generate links
  var links = {};
  if (page < lastPage) {
    links.next = 'http://localhost:8080/api/data?page=' + ( page + 1 ) + '&per_page=' + perPage;
  }
  if (page > 0) {
    links.prev = 'http://localhost:8080/api/data?page=' + ( page - 1 ) + '&per_page=' + perPage;
  }
  links.last = 'http://localhost:8080/api/data?page=' + lastPage  + '&per_page=' + perPage;

  res.setHeader('X-Total-Count', dbMock.people.length);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'link, X-Total-Count')
  res.links(links);
  res.json(result);
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
