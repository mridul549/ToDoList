const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require("mongoose");
const path       = require('path')
const date       = require(__dirname + "/date.js");

const app = express();
let day = date.getDate();

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')));

const dbUrl = "mongodb+srv://mridul549:FvHsycCMxTni5tuk@cluster0.btmg6aw.mongodb.net/?retryWrites=true&w=majority"

const itemsSchema = new mongoose.Schema ({
    name: String
})

const listSchema = new mongoose.Schema ({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List",listSchema);

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
    name: "Welcome to the To Do List!"
})

const item2 = new Item ({
    name: "Hit the + button to add a new item"
})

const item3 = new Item ({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1,item2,item3];

app.get('/',function(req,res){
    Item.find(function(err,items){
        if(err){
            console.log(err);
        } else {
            if (items.length===0) {
                Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("Success!");
                    }
                })   
                res.redirect("/");
            } else {
                res.render("list",{listTitle: day, newListItem: items});
            }
        }
    })
})
 
app.get("/:topic",function(req,res){
    const customListName = req.params.topic;

    List.findOne({name: customListName},function(err,results){
        if(!err){
            if(!results){
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            } else {
                res.render("list",{listTitle: results.name, newListItem: results.items});
            }
        }
    })
})

app.post("/",function(req,res){
    let itemName = req.body.newItem;
    let listName = req.body.list; 
    const newItem = new Item ({
        name: itemName
    })
    if(listName==day){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
})

app.post("/delete",function(req,res){
    const docID = req.body.checkBox;
    Item.findByIdAndRemove(docID,function(err){
        if(!err){
            res.redirect("/");
        }
    })
})

app.listen(3000, function(){
   console.log('Server Started!');
});

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(dbUrl, connectionParams).then(() => {
    console.info("connected to the DB")
}).catch((e)=>{
    console.log("Error",e);
})