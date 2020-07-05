const router = require('express').Router();
const httpStatusCode = require('../utils/http-status-code.js');

router.get('/', (req, res) => {
  res.status(httpStatusCode.OK).json({ message: 'Valorant API Gateway reached' });
});

// router.use('/auth', require('./authentication.js'));
router.use('/healthcheck', require('./healthcheck.js'));

module.exports = router;
