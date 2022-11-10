const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running')
});



const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.pra9xm3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('mrPhotographer').collection('photoServices');
        const reviewCollection = client.db('mrPhotographer').collection('reviews');

        // Service Api 
        app.get('/services', async (req, res) => {
            const size = parseInt(req.query.size);
            const query = {}
            const cursor = serviceCollection.find(query).sort({ $natural: -1 });
            const services = await cursor.limit(size).toArray();
            res.send(services);
        })

        app.get('/services/:serviceId', async (req, res) => {
            const id = req.params.serviceId;
            const query = { _id: ObjectId(id) };
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray();
            res.send(service);
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // Review Api 

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.serviceId) {
                query = {
                    serviceId: req.query.serviceId
                }
            } else if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const updatedReview = req.body.updatedReview;
            console.log(updatedReview);
            const query = { _id: ObjectId(id) }
            const updateReview = {
                $set: {
                    reviewData: updatedReview
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview);
            res.send(result);
        })
    }
    finally {

    }
}

run()


app.listen(port, () => {
    console.log(`simple node server is running on port: ${port}`)
});