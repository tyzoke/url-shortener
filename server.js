const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const url = require('url');
const shortId = require('shortid')
const uri = 'mongodb+srv://chiraggautam1620:chirag@cluster0.65unq7m.mongodb.net/shorturldb?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

app.use(express.static('views'));
const port =process.env.PORT || 5000
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine', 'ejs');


var collection; 


app.get('/', async (req, res) => {
  try {
    const shorturls = await collection.find({}).toArray();
    res.render('index', { shorturls: shorturls });
  } catch (err) {
    console.error('Failed to fetch short URLs:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search", async (req, res) => {
  try {
    
    let fullResult = await collection.aggregate([
      {
        "$search": {
          "index": "serachurlindex",
          "autocomplete": {
            "query": `${req.query.term}`,
            "path": "full",
            "fuzzy": {
              "maxEdits": 1
            }
          }
        }
      },
      {
        "$project": {
          "_id": 1
        }
      }
    ]).toArray();
    
    let shortResult = await collection.aggregate([
      {
        "$search": {
          "index": "serachurlindex",
          "autocomplete": {
            "query": `${req.query.term}`,
            "path": "short",
            "fuzzy": {
              "maxEdits": 1
            }
          }
        }
      },
      {
        "$project": {
          "_id": 1
        }
      }
    ]).toArray();
    
    let noteResult = await collection.aggregate([
      {
        "$search": {
          "index": "serachurlindex",
          "autocomplete": {
            "query": `${req.query.term}`,
            "path": "note",
            "fuzzy": {
              "maxEdits": 1
            }
          }
        }
      },
      {
        "$project": {
          "_id": 1
        }
      }
    ]).toArray();
    
    let resultSet = new Set([
      ...noteResult.map((doc) => doc._id),
      ...fullResult.map((doc) => doc._id),
      ...shortResult.map((doc) => doc._id)
    ]);
    
    let result = await collection.find({ _id: { $in: Array.from(resultSet) } }).toArray();
    
    res.json(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
})

app.post('/shortUrls', async (req, res) => {
  const existingUrl = await collection.findOne({ full: req.body.urlInput });

  // if (!existingUrl) {
  //   await collection.insertOne({
  //     full: req.body.urlInput,
  //     short: shortId.generate(),
  //     note: req.body.noteInput,
  //     clicks: 0
  //   });
  // }
  
  // res.redirect('/' );

  if (!existingUrl) {
    const short = shortId.generate();
    const note = req.body.noteInput;
    // Get the site domain
    const siteUrl = req.protocol + '://' + req.get('host');
    const shortenedUrl = siteUrl + '/' + short;
    const clicks = 0;

    const newUrl = {
      full: req.body.urlInput,
      short: shortenedUrl,
      note: note,
      clicks: clicks
    };

    await collection.insertOne(newUrl);

    res.render('index', { shorturls: await collection.find({}).toArray(), shortenedUrl: shortenedUrl });
  } else {
    res.render('index', { shorturls: await collection.find({}).toArray(), shortenedUrl: null });
  }

 
});

app.get('/:shortUrl', async (req, res) => {
  const siteUrl = req.protocol + '://' + req.get('host');
  const shortenedUrl = siteUrl + '/' + req.params.shortUrl;
  const shorturl = await collection.findOne({ short: shortenedUrl });
  if (!shorturl) {
    return res.sendStatus(404);
  }

  shorturl.clicks++;
  await collection.updateOne({ _id: shorturl._id }, { $set: { clicks: shorturl.clicks } });

  res.redirect(shorturl.full);
});



app.listen(port, async () => {
  try {
    // Connect to the MongoDB server
    await client.connect();
    
    // Access the desired collection
    collection=client.db("shorturldb").collection("shorturls");

    console.log('Connected to the MongoDB database');

    // Start listening for requests
    console.log('Server started on port 5000');
  } catch (err) {
    console.error('Failed to connect to the MongoDB database:', err);
  }
});









