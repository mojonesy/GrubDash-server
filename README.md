# GrubDash-server
This is a project through Thinkful in backend development. 
"Grubdash" is a mock food delivery web app, and this server is practice in using Express for state management and building a RESTful API.
HTTP requests to the API are handled to create, read, update, delete and list data from two separate resources. 
Routes, URLs and middleware are defined to implement the API.

## Data
Data includes information about the current dishes being offered and food orders. 
Dish data is structured as follows:
``` 
    {
      id: "90c3d873684bf381dfab29034b5bba73",
      name: "Falafel and tahini bagel",
      description: "A warm bagel filled with falafel and tahini",
      price: 6,
      image_url:
        "https://images.pexels.com/photos/4560606/pexels-photo-4560606.jpeg?h=530&w=350",
    }
```
And orders, with nested dish data:
```
    {
    id: "f6069a542257054114138301947672ba",
    deliverTo: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    mobileNumber: "(202) 456-1111",
    status: "out-for-delivery",
    dishes: [
      {
        id: "90c3d873684bf381dfab29034b5bba73",
        name: "Falafel and tahini bagel",
        description: "A warm bagel filled with falafel and tahini",
        image_url:
          "https://images.pexels.com/photos/4560606/pexels-photo-4560606.jpeg?h=530&w=350",
        price: 6,
        quantity: 1,
      },
    ],
  }
```

## Controllers & Routers
- Dishes and orders each have a controller file for handling HTTP requests with appropriate validation middleware.
Data passed between handler functions and middleware uses the `locals` property on the response to share variables scoped to the request, and avoid duplicate code.
- The router files for dishes and orders contain chained methods for `/orders`, `/:orderId`, `/dishes` and `/:dishId`, and allow for `GET`, `POST`, `PUT` and `DELETE` requests.
Handlers are attached from the exported controllers.

## Handler Functions
- Both dishes and orders can be created, and can be read and updated by ID number.
- Orders with a status other than "pending", as well as dishes, cannot be deleted. An order with a status of "delivered" cannot be updated.
- All update handlers guarantee that the `id` property of the stored data cannot be overwritten.
