const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// List handler
function list(req, res) {
    res.json({ data: dishes });
}

// Parameter validation
function bodyDataHas(propertyName){
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`
        });
    };
}

function propertyIsNotEmpty(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (propertyName.length === 0) {
            next({
                status: 400, 
                message: `Dish must include a ${propertyName}` 
            });
        }
        next();
    }
}

function priceIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (!Number.isInteger(price) || price <= 0 ) {
        next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    }
    next();
}

// Create handler
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// Dish Exists?
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}

// Read handler
function read(req, res) {
    res.json({ data: res.locals.dish });
}

// Update handler
function update(req, res, next) {
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    if (id && id !== dish.id) {
        return next({ status: 404, message: `Dish id does not match route id. Dish: ${id}, Route: ${dish.id}`});
    }
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
}

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        propertyIsNotEmpty("name"),
        propertyIsNotEmpty("description"),
        propertyIsNotEmpty("image_url"),
        priceIsValid,
        create
    ],
    list,
    read: [dishExists, read],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        propertyIsNotEmpty("name"),
        propertyIsNotEmpty("description"),
        propertyIsNotEmpty("image_url"),
        priceIsValid,
        update],
}