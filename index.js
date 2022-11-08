const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;

app.get('/', (req, res) => {
    res.send('Server is running')
});



const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.pra9xm3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
    console.log("database connected")
});


app.use(cors())

app.listen(port, () => {
    console.log(`simple node server is running on port: ${port}`)
});