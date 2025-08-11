const express = require('express')
const verifyToken = require('../middleware/verify-token.js')
const Menu = require('../models/menu.js')
const router = express.Router()

// const router = express.Router({ mergeParams: true });


// All router private =
router.use(verifyToken)


//---------------------- GET All Menu -------------------------------------
router.get('/', async (req , res) => {
    try {
    const menus = await Menu.find({ restaurant: req.params.restaurantId })
        .populate('author')
         .sort({createdAt: 'desc'})

       res.status(200).json(menus)  
    } catch (err) {
       res.status(500).json(err)
    }
})
//-------------------------------------------------------------------------





//----------------------  POST: Create Menu -------------------------------------
router.post('/', async (req , res) => {
    try {
       req.body.author = req.user._id

 req.body.restaurant = req.params.restaurantId;

       const menu = await Menu.create(req.body)
       menu._doc.author = req.user
       res.status(200).json(menu) 
    } catch (err) {
       res.status(500).json(err) 
    }
})
//------------------------------------------------------------------------------





//----------------------------- PUT: Update menu --------------------------------------------
router.put('/:menuId', async (req , res) => {
    try {
          const menu = await Menu.findOne({ _id: req.params.menuId, restaurant: req.params.restaurantId });

          if (!menu){ 
                return res.status(404).send('Menu not found, there is no menu')
            }

        if(!menu.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!")
         }

        const updatedMenu  = await Menu.findByIdAndUpdate(
            req.params.menuId,
            req.body,
            {new: true}
        )

        updatedMenu ._doc.author = req.user

        res.status(200).json(updatedMenu )
    } catch (err) {
        res.status(500).json(err)
    }
 })
//-------------------------------------------------------------------------





//--------------------------------- DELETE: Delete menu ----------------------------------------
    router.delete('/:menuId', async (req , res) => {
        try {
            const menu = await Menu.findOne({ _id: req.params.menuId, restaurant: req.params.restaurantId });

             if (!menu){ 
                return res.status(404).send('Menu not found, there is no menu')
            }

             if(!menu.author.equals(req.user._id)){
                return res.status(403).send("You're not allowed to do that!")
             }

                const deletedMenu = await Menu.findByIdAndDelete(req.params.menuId)
                res.status(200).json(deletedMenu)
            
        } catch (err) {
            	res.status(500).json(err)
        }

    })  
//-------------------------------------------------------------------------


