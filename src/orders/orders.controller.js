const path = require("path");
const { isArray } = require("util");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// List handler
function list(req, res) {
    res.json({ data: orders });
}

// Parameter validation
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Order must include a ${propertyName}`
        });
    };
}

function propertyIsNotEmpty(propertyName) {
    return function (req, res, next) {
        if (propertyName.length === 0) {
            next({
                status: 400, 
                message: `Order must include a ${propertyName}` 
            });
        }
        next();
    }
}

function dishIsNotEmpty(dishes) {
    return function (req, res, next) {
        const { data: { dishes } = {} } = req.body;
        if (!Array.isArray(dishes) || dishes.length === 0) {
            next({
                status: 400,
                message: "Order must include at least one dish"
            });
        }
        next();
    }
}

function dishHasQuantity(dishes) {
    return function (req, res, next) {
        const { data: { dishes } = {} } = req.body;
        dishes.forEach((dish, index) => {
            if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
                next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is an integer greater than 0`
                });
            }
        });

        next();
    }
}

// Create handler
function create(req, res) {
    const { 
        data: { deliverTo, mobileNumber, status, 
            dishes: [{ id, name, description, image_url, price, quantity }]
            } = {} 
    } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes: [{ id, name, description, image_url, price, quantity }]
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// Order Exists?
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({ status: 404, message: `Order does not exist: ${orderId}.`});
}

// Read handler
function read(req, res) {
    res.json({ data: res.locals.order });
}

module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        propertyIsNotEmpty("deliverTo"),
        propertyIsNotEmpty("mobileNumber"),
        dishIsNotEmpty("dishes"),
        dishHasQuantity("dishes"),
        create
    ],
    list,
    read: [orderExists, read],
}