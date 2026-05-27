const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/admin.middleware');
const {
  getAllUsers,
  createUser,
  getAllMeals,
  updateMealStatus,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/admin.controller');

router.use(adminAuth);

router.get('/users', getAllUsers);
router.post('/users', createUser);

router.get('/meals', getAllMeals);
router.patch('/meals/:id/status', updateMealStatus);

router.post('/meals/:id/comments', addComment);
router.get('/meals/:id/comments', getComments);
router.delete('/comments/:id', deleteComment);

module.exports = router;
