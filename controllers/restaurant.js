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
    const restaurant = await Restaurant.findById(req.params.restaurantId)
      .populate("ownerId")
      .populate("menu.creatorId");

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant.menu);
  } catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------

//----------------------  POST: Create Menu -------------------------------------
router.post("/:restaurantId/menu/new", async (req, res) => {
  try {
    req.body.creatorId = req.user._id; // add creatorId to menu item

    // Find the restaurant by ID
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    // Add the new menu item to the menu array
    restaurant.menu.push(req.body);

    // Save the updated restaurant
    await restaurant.save();

    // Get the newly added menu item (last one)
    const newMenuItem = restaurant.menu[restaurant.menu.length - 1];

    res.status(201).json(newMenuItem);
  } catch (err) {
    console.error(err);
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
router.put("/:restaurantId/menu/:menuId", async (req, res) => {
  try {
    // Find the restaurant by ID
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    // Find the menu item subdocument by menuId
    const menuItem = restaurant.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).send("Menu item not found");
    }

    // Check if logged-in user is creator of the menu item
    if (!menuItem.creatorId.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to update this menu item");
    }

    // Update menu item fields with req.body
    menuItem.name = req.body.name || menuItem.name;
    menuItem.type = req.body.type || menuItem.type;
    menuItem.description = req.body.description || menuItem.description;
    menuItem.price = req.body.price || menuItem.price;

    // Save the parent restaurant document
    await restaurant.save();

    res.status(200).json(menuItem);
  } catch (err) {
    res.status(500).json(err);
  }
});


// -------------------------------------------------------------------------

//--------------------------------- DELETE: Delete menu ----------------------------------------
router.delete("/:restaurantId/menu/:menuId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    const menuItem = restaurant.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).send("Menu item not found");
    }

    if (!menuItem.creatorId.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to delete this menu item");
    }

    // Remove menu item by filtering out the one with menuId
    restaurant.menu = restaurant.menu.filter(item => item._id.toString() !== req.params.menuId);

    await restaurant.save();

    res.status(200).json({ message: "Menu item deleted" });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;