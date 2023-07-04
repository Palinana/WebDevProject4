const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
  
const MONGO_URI = process.env.MONGO_URI;

MongoClient.connect(MONGO_URI)
    .then((client) => {
        console.log('Connected to Database');
        const db = client.db('star-wars-quotes');
        const quotesCollection = db.collection('quotes');

        app.set('view engine', 'ejs');

        app.use(express.static('public'));

        // middleware that handles reading data html froms
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        app.get('/', (req, res) => {
            db.collection('quotes')
              .find()
              .toArray()
              .then(results => {
                res.render('index.ejs', { quotes: results })
              })
              .catch(error => console.error(error))
        });

        app.post('/quotes', (req, res) => {
            quotesCollection
              .insertOne(req.body)
              .then(result => {
                res.redirect('/');
              })
              .catch(error => console.error(error))
        });

        app.put('/quotes', (req, res) => {
            quotesCollection
                .findOneAndUpdate(
                    { name: 'Yoda' },
                    {
                        $set: {
                            name: req.body.name,
                            quote: req.body.quote,
                        },
                    },
                    {
                        upsert: true,
                    }
                )
                .then(result => {
                    res.json('Success');
                })
                .catch(error => console.error(error));
        });

        app.delete('/quotes', (req, res) => {
            quotesCollection
                .deleteOne({ name: req.body.name })
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('No quote to delete');
                    }
                    res.json(`Deleted Darth Vader's quote`);
                })
                .catch(error => console.error(error));
        })

    })
    .catch(error => console.error(error));
