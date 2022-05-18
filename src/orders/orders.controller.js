const req = require("express/lib/request");
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

// Status validation
function validateStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (!status || status.length === 0 || status === "invalid") {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        });
    } else if (status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed"
        });
    } else {
        next();
    };
}

// Update handler
function update(req, res, next) {
    const order = res.locals.order;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (id && id !== order.id) {
        return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${order.id}`});
    }
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}

// Delete handler
function destroy(req, res, next) {
    const order = res.locals.order;
    const { orderId } = req.params;
    if (order.status !== "pending") {
        next({ status: 400, message: "An order cannot be deleted unless it is pending"});
    }
    const index = orders.findIndex(order => order.id === orderId);
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
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
    update: [
        orderExists, 
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        propertyIsNotEmpty("deliverTo"),
        propertyIsNotEmpty("mobileNumber"),
        dishIsNotEmpty("dishes"),
        dishHasQuantity("dishes"),
        validateStatus,
        update
    ],
    delete: [orderExists, destroy]
}