const express = require('express');
const { create, searchByGeo } = require('../controllers/instanceController');
const router = express.Router();

router.post('/', create);

router.get('/search/geo', searchByGeo);

module.exports = router;
