const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// require mongoose module
const mongoose = require("mongoose");
const _ = require("lodash");


// use ejs file in views folder 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// to eliminate the Deprecation Warning
mongoose.set("strictQuery", false);
// connect to mongodb database todolistDB if it doesn't exits it will create a new databse called todolistDB
mongoose.connect('mongodb+srv://admin-1:Test123@cluster0.rgf4etl.mongodb.net/todolistDB');


// create a new items Schema
const itemsSchema = new mongoose.Schema({
  name:String
});
// use the schema to create a new model/ collection, the collection's name is "Item" 
const Item = mongoose.model("Item", itemsSchema);
// create new document use mongoose module
const item1 = new Item ({
  name:"Welcome to you todolist!"
});

const item2= new Item ({
  name:"Hit the + button to add a new item."
});

const item3= new Item ({
  name:"<-- Hit this to delete an item."
});
// create an array of the newly added items
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemsSchema]
})

const List = mongoose.model("List", listSchema);





app.get("/", function(req,res){


    Item.find({}, function(err,foundItems){
      if (!err){
      if (foundItems.length === 0) {


        // insert the array of items into database 
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Items successfully added to DB");
          }
        });
        res.redirect("/");
      } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
      }   
    }
  });

  

});


app.get("/:listName", function(req,res){
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name:customListName}, function(err, foundList){
    if (!err){
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
        } else {
          // Show existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    }
  })
})



app.post("/", function(req,res){

  // get the value of user's input from html
  const itemName = req.body.newItem;
  // get the list name from the value of submit button 
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });
//  if list name is today, save the item to the default list
  if (listName === "Today") {

    newItem.save();
    res.redirect("/");

  } else {
    // Check if there is an existing list in list data collection
    List.findOne({name:listName}, function(err,foundList)
    {
      // push new item to the existing list
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }



});


app.post("/delete", function(req, res){
  // get item id from the checkbox input, call onchange fucntion, return the item id as value and send the item id of checkbox 
  const checkedItemID = req.body.checkbox;
  // get the list name from the hidden input value
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (!err){
        res.redirect("/");
      }
  });
  } else {
    // mongoose $pull operator
    List.findOneAndUpdate({name:listName},
        {$pull:{items: {_id: checkedItemID}}}, 
        function(err){
          if (!err){
            res.redirect("/"+listName);
          }
        });
  }


});


app.get("/work", function (req,res) { 
  res.render("list", {listTitle: "Work List", newListItems:workItems});

 });

 app.post("/work", function (req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");

 });

app.get("/about", function(req,res){
  res.render("about");
});


app.listen(3000, function(req,res){
  console.log("Server started running on port 3000");
})

