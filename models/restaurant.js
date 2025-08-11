const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content: String,
    authorId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })


const foodSchema = new mongoose.Schema({
    name: String,
    type: String,
    description: String,
    price: Number,
})

const restaurantSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.ObjectId, ref: 'User'
    },
    name:{
        type: String,
        required: true,
    },
    type:{
        required: true,
        type: String,
    },
    image: {
        url: { type: String, required: true },
        cloudinary_id: { type: String, required: true}
    },
    location:{
        required: true, 
        type: String,
    },
    description: {
        required: true,
        type: String
    },
    menu:[foodSchema],
    comments: [commentSchema],
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)
module.exports = Restaurant