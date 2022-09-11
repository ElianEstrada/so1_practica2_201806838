const express = require('express');
const cors = require('cors');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(json());

app.use(require('./routes/data.route'));

app.listen(4000, () => {
    console.log("Server listening on port: 4000");
});