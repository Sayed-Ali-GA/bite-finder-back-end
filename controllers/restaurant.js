const express = require("express");
const varifyToken = require("../middleware/verify-token");
const Restaurant = require("../models/restaurant.js");
const router = express.Router();
// ========== Public Routes ===========
//  LANDING PAGE

// ========= Protected Routes =========

router.use(varifyToken);
// GET ALL RESTAURANTS
router.get("/", async (req, res) => {
  console.log('inside get')
  try {
    const restaurants = await Restaurant.find({})
      .populate("ownerId")
      .sort({ createdAt: "desc" });
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE A RESTAURANT

router.post("/new", async (req, res) => {
  try {
    req.body.ownerId = req.user._id;
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// SHOW A SINGLE RESTAURANT
router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId)
      .populate("ownerId")
      .populate("comments.authorId"); // populate each comment's author
    if (!restaurant) {
      return res.status(404).json({ err: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json(err);
  }
});


// UPDATE A RESTAURANT
router.put("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    // check for permissions using logged-in user
    if (!restaurant.ownerId.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to do that");
    }

    // update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.restaurantId,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedRestaurant);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a restaurant
router.delete("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant.ownerId.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to do that");
    }
    const deletedRestaurant = await Restaurant.findByIdAndDelete(
      req.params.restaurantId
    );
    res.status(200).json(deletedRestaurant);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE A COMMENT
router.post("/:restaurantId/comments", async (req, res) => {
  try {
    req.body.authorId = req.user._id;
    req.body.text = req.body.text; // ensure comment text is passed

const restaurant = await Restaurant.findById(req.params.restaurantId);
restaurant.comments.push(req.body);
await restaurant.save();


    // find the newly created comment
    const newComment = restaurant.comments[restaurant.comments.length - 1];

    newComment.authorId = req.user;

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a comment
router.delete("/:restaurantId/comments/:commentId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    const comment = restaurant.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not allowed to do that");
    }

    // Remove comment manually instead of using comment.remove()
    restaurant.comments = restaurant.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await restaurant.save();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: err.message });
  }
});





// get all menu items
router.get("/:restaurantId/menu", async (req, res) => {
  try {
    const menus = await Restaurant.find({ restaurant: req.params.restaurantId })
      .populate("ownerId")
      .populate("menu.creatorId")
      .sort({ createdAt: "desc" });

    res.status(200).json(menus);
  } catch (err) {
    res.status(500).json(err);
  }
});
//-------------------------------------------------------------------------

//----------------------  POST: Create Menu -------------------------------------
router.post("/:restaurantId/menu", async (req, res) => {
  try {
    req.body.creatorId = req.user._id;

    // req.body.restaurant = req.params.restaurantId;

    const menuItem = await Restaurant.create(req.params.restaurantId);
    menuItem.menu.push(req.body);
    await menu.save();
    const newMenuItem = menu.menu[menu.menu.length - 1];

    // menu._doc.author = req.user;
    res.status(200).json(newMenuItem);
  } catch (err) {
    res.status(500).json(err);
  }
});
//------------------------------------------------------------------------------

//----------------------------- PUT: Update menu --------------------------------------------
// router.put("/restaurantId:/:menuId", async (req, res) => {
//   try {
//     const menuItem = await Restaurant.findById({
//       // _id: req.params.menuId,
//       // restaurant: req.params.restaurantId,
//     });

//     if (!menu) {
//       return res.status(404).send("Menu not found, there is no menu");
//     }

//     if (!menu.author.equals(req.user._id)) {
//       return res.status(403).send("You're not allowed to do that!");
//     }

//     const updatedMenu = await Menu.findByIdAndUpdate(
//       req.params.menuId,
//       req.body,
//       { new: true }
//     );

//     updatedMenu._doc.author = req.user;

//     res.status(200).json(updatedMenu);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
//
router.put("/:restaurantId/:menuId", async (req, res) => {
  const menuItem = await Restaurant.findById(req.params.menuId);
  try {
    if (!menuItem.creatorId.equals(req.user._id)) {
      return res.status(403).send("You are not allowed");
    }

    const updatedMenuItem = await Restaurant.findByIdAndUpdate(
      req.params.menuId,
      req.body,
      { new: true }
    );
    updatedMenuItem._doc.creatorId = req.user;

    res.status(200).json(updatedMenuItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -------------------------------------------------------------------------

//--------------------------------- DELETE: Delete menu ----------------------------------------
router.delete("/:restaurantId/:menuId", async (req, res) => {
  try {
    const menuItem = await Restaurant.findById(req.params.menuId);

    if (!menuItem.creatorId.equals(req.user._id)) {
      return res.status(403).send("You are not alloewd");
    }

    const deletedMenuItem = await Restaurant.findByIdAndDelete(
      req.params.menuId
    );
    res.status(200).json(deletedMenuItem);
  } catch (err) {
    res.status(500).json(err);
  }

  //   if (!menu) {
  //     return res.status(404).send("Menu not found, there is no menu");
  //   }

  //   if (!menu.author.equals(req.user._id)) {
  //     return res.status(403).send("You're not allowed to do that!");
  //   }

  //   const deletedMenu = await Menu.findByIdAndDelete(req.params.menuId);
  //   res.status(200).json(deletedMenu);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
});

module.exports = router;