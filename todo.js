const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const _=require("lodash");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(express.static("public"));   //css file

//data base by mongoose
const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/todolist",{useNewUrlParser:true});

//schema  
const itemsSchema={ 
  name: String
};
const Item=mongoose.model("items",itemsSchema);
 
const listSchema ={
  name :String,
  items: [itemsSchema]
};

const item1=new Item({name :"Welcome to yor todolist"});
const item2=new Item({name :"Hit the + button to add anew item."});
const item3=new Item({name :"<-- Hit this to delete an items."});
const defaultitems =[item1,item2,item3];
const List =mongoose.model("List",listSchema);

app.get("/",function(req,res)
{
      Item.find({},(err,founditems)=>
      {
        if(err)
            console.log("error");
        if(founditems.length === 0)
        {
            Item.insertMany(defaultitems ,(err)=>
            {
                if(err)
                   console.log(err);

                  res.redirect("/");
            });
        }else {
          res.render("liest",{Title:"today",newitems:founditems});
        }
      });
    
});

app.post("/",function(req,res)
{
    const itemName= req.body.item;
    const listName= req.body.list;
   // if(req.body.item=="")
    //    return res.redirect("/");

     const data=  new Item(
        {
          name : itemName
        });
        
     if(listName == "today")   
     {
          data.save();
        res.redirect("/");
     }
     else
      {
        List.findOne({name : listName},(err,foundList)=>
        {
          if(err)
            console.log(err);
          else
          {
        foundList.items.push(data);
            foundList.save();
            res.redirect("/" + listName);
          }
        });
      }
});

app.post("/delete",(req,res)=>
{
    const checkedItemId =req.body.checkbox;
    const listName= req.body.listName;
    if( listName === "today")
    {
      Item.findByIdAndRemove(checkedItemId,(err)=>{
        if (!err)
        {
          res.redirect("/");
        }
      });
    }
    else
    {
      List.findOneAndUpdate( {name :listName},{$pull :{items : {_id: checkedItemId }}},(err,found)=>
      {
        if(! err)
        res.redirect("/" +listName);
      });
    }
});

app.get("/:customname",(req,res)=>
{
   const customName = _.capitalize(req.params.customname);
   List.findOne({name: customName},(err,foundList)=>
   {
      if(!err)
         {
           if(!foundList)
           {
             new List(
              {
                name: customName,
                items: defaultitems
              }).save(); 
              res.redirect("/" + customName);
           }
           else
           {
            //   console.log("old one");
              res.render("liest",{Title:foundList.name,newitems: foundList.items});
           }
         }
   });


});

 
app.listen(8000,function()
{
  console.log("listen in 8000");
});