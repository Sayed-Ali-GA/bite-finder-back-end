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

router.post("/", async (req, res) => {
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
    const restaurant = await Restaurant.findById(
      req.params.restaurantId
    ).populate("ownerId");
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE A RESTAURANT
router.put("/:restaurantId",async (req,res)=>{
  try{
      // find the restaurant
      const restaurant=await Restaurant.findById(req.params.restaurantId)

      // check for permissions
      if(!restaurant.ownerId.equals(req.body._id)){
        return res.status(403).send("You are not allowed to do that")
      }

      // update restauranr
    const updatedRestaurant= await Restaurant.findByIdAndUpdate(req.params.restaurantId, req.body,
      {new:true}
    )

    // append req.user to the ownerId property
    updatedRestaurant.doc.ownerId=req.user

    // issue json response
    res.status(200).json(updatedRestaurant)

  } catch(err){
    res.status(500).json(err)
  }
})

// delete a restaurant
router.delete("/:restaurantId" ,async (req,res)=>{
  try{

    const restaurant =await Restaurant.findById(req.params.restaurantId)

    if(!restaurant.ownerId.equals(req.user._id)){
      return res.status(403).send("You are not allowed to do that")
    }
     const deletedRestaurant=await Restaurant.findByIdAndDelete(req.params.restaurantId)
     res.status(200).json(deletedRestaurant)
  } catch(err){
    res.status(500).json(err)
  }
})

// CREATE A COMMENT 
router.post("/:restaurantId/comments", async (req,res)=>{
  try{
    req.body.authorId=req.user._id
    const restaurant= await Restaurant.findById(req.params.restaurantId)
    restaurant.comments.push(req.body)
    await restaurant.save()
    
    // find the newly created comment
    const newComment= Restaurant.comments[Restaurant.comments.length -1]
    newComment.doc.authorId=req.user
    res.status(201).json(newComment)

  } catch(err){
    res.status(500).json(err)
  }
})

// Delete a comment
router.delete("/restaurantId:/comments/:commentId" ,async(req,res)=>{
  try{
    const comment= await Restaurant.findById(req.params.commentId)

    if(!comment.authorId.equals(req.user._id)){
      res.status(403).send("You are not allowed to do that")
    }

    const deletedComment= await Restaurant.findByIdAndDelete(req.params.commentId)

    res.status(200).json(deletedComment)

  } catch(err){
    res.status(500).json(err)
  }
})


module.exports = router