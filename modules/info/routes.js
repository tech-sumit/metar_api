const express = require('express');
const router = express.Router();
const info = require('./controllers/info')

//info routes
router.get('/info', info.get);

module.exports = router;
