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
      name: faker.name.findName(),
      email: faker.internet.email(),
      date: faker.date.past()
    };
    console.log('populating ', person);
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
    res.setHeader("X-Total-Count", "123");
    res.links({
        next: 'http://api.example.com/users?page=2',
        last: 'http://api.example.com/users?page=5'
    });
    res.json({ message: 'hooray! welcome to our api!' });
});

// ?page=2&per_page=100

router.get('/data', function(req, res) {
  res.setHeader("X-Total-Count", dbMock.people.length);

  res.links({
    next: 'http://localhost:8080/data?page=2',
    last: 'http://localhost:8080/data?page=5'
  });

  res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
