const express = require('express')
const mongoose = require('mongoose')
const Product = require('./models/productModel')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))


// WebSockets 
io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})
//routes

//  get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// get product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params
        const product = await Product.findById(id)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// create a product
app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body)
        io.emit('productAdded', console.log(product)) // broadcast the change to all connected clients
        res.status(200).json(product)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: error.message
        })
    }
})

// update a product
app.put('/products/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params
        const product = await Product.findByIdAndUpdate(id, req.body)
        // we cannot find any product in database
        if (!product) {
            return res.status(404).json({
                message: `cannot find any product with ID ${id}`
            })
        }
        const updatedProduct = await Product.findById(id)
        io.emit('productUpdated', console.log(updatedProduct)) // broadcast the change to all connected clients
        res.status(200).json(updatedProduct)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// delete a product
app.delete('/products/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params
        const product = await Product.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({
                message: `cannot find any product with ID ${id}`
            })
        }
        io.emit('productDeleted', console.log(product)) // broadcast the change to all connected client
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

io.on('connection', socket => {
    console.log('Client connected')
})

//Connected to MongoDB
mongoose.set('strictQuery', false)
mongoose
    .connect('mongodb://localhost:27017/real-time_inventory_management_system')
    .then(() => {
        console.log('connected to MongoDB')
        app.listen(5000, () => {
            console.log('app is running on port 5000')
        })
    })
    .catch(error => {
        console.log(error)
    })