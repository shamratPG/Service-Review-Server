const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res?.status(401).send({ message: 'UnauthoriZed' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res?.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    })
}

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
        const blogCollection = client.db('mrPhotographer').collection('Blogs');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        //Blogs Api 
        app.get('/blogs', async (req, res) => {
            const query = {}
            const cursor = blogCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

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

        app.post('/services', verifyJWT, async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // Review Api 

        // Open Api 
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.serviceId) {
                query = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor = reviewCollection.find(query).sort({ date: -1 })

            // collection.find().sort({datefield: -1}, function(err, cursor){...});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // JWT api 
        app.get('/reviews/:email', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            const email = req.params.email;

            if (decoded?.email !== email) {
                req?.status(403).send({ message: 'Unauthorized' })
            }
            let query = { email: email };
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review);
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