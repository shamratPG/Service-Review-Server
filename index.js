const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.get('/services', async (req, res) => {
            const size = parseInt(req.query.size);
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(size).toArray();
            res.send(services);
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log(service)
            const result = await serviceCollection.insertOne(service);
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