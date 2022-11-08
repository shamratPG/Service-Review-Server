const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.send('Server is running')
});

app.use(cors())

app.listen(port, () => {
    console.log(`simple node server is running on port: ${port}`)
});