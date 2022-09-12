const express = require('express');
const connection = require('../config/connection');
const router = express.Router();

router.get("/cpu", (req, res) => {

    const query = "SELECT content FROM cpu_module ORDER BY date_insert DESC LIMIT 1;";
    try {
        connection.execute(query, (err, result) => {
            if (err) {
                console.log(err);
                res.status(400).send({"message": "Failed connection"});
            } else {
                res.status(200).send({"message": "successfully", "data": JSON.parse(result[0].content)});
            }
        });
    } catch(e) {
        console.log(e);
    }
});

router.get("/ram", (req, res) => {

    const query = "SELECT content FROM ram_module ORDER BY date_insert DESC LIMIT 1;";
    try {
        connection.execute(query, (err, result) => {
            if (err) {
                console.log(err);
                res.status(400).send({"message": "Failed connection"});
            } else {
                res.status(200).send({"message": "successfully", "data": JSON.parse(result[0].content)});
            }
        });
    } catch (e) {
        console.log(e);
    }

});

module.exports = router;