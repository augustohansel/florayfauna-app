const express = require('express');
const { search, getDetails } = require('../controllers/taxonController');

const router = express.Router();

router.get('/search', search);
router.get('/details/:id', getDetails);

module.exports = router;
