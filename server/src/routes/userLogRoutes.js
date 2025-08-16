const express = require('express');
const { getAllUserLogs, deleteUserLog } = require('../controller/userLogController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);
router.get('/', getAllUserLogs);
router.delete('/:id', deleteUserLog);

module.exports = router;