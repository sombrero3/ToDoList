//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Sombi:Tovlipo2!@cluster0.htxqf62.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "First Item"
})

const item2 = new Item({
  name: "Second Item"
})

const item3 = new Item({
  name: "Third Item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("deafultItems succesfully add to the data base!!!");
          }
        });
        res.redirect("/");
      }
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })

});

app.get("/:customListName", function (req, res) {
  const customListName =_.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const curItem = new Item({
    name: itemName
  })

  if (listName === "Today") {
    curItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          console.log("List Dosen't Exist!!");
        } else {
          foundList.items.push(curItem);
          foundList.save();
          res.redirect("/" + listName);
        }
      } else {
        console.log(err);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
    // List.findOne({ name: listName }, function (err, foundList) {
    //   if (!err) {
    //     if (!foundList) {
    //       console.log("List Dosen't Exist!!");
    //     } else {
    //       foundList.items.findByIdAndRemove(checkedItemId, function (err) {
    //         if (err) {
    //           console.log(err);
    //         } else {             
    //           res.redirect("/" + listName);
    //         }          
    //       });
    //     }
    //   } else {
    //     console.log(err);
    //   }
    // });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
