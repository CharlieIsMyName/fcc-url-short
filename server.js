var express=require("express");
var app=express();
var url=require("url");
var mongo=require("mongodb").MongoClient;
var port=process.env.PORT||8080

var dburl='mongodb://charlie1996:13243546@ds017514.mlab.com:17514/charliedb';


app.get("/new/*",function(req,res){
  mongo.connect(dburl,function(err,db){
    if(err){
      console.log("failed to connect to cloub DB!");
      res.end("failed to connect to cloub DB!");      //our data base entry is going to be {url,id}
      throw err;
    }
    
    //map the url with id
    var map=db.collection('fcc-url-redirect');
    map.count({},function(err,count){
      if(err) throw err;
      var path=url.parse(req.url).pathname;
      var id=count;
      path=path.substring(5,path.length);
      
      
      if((path.substring(0,7)!="http://")&&(path.substring(0,8)!="https://")){
        db.close();
        res.json({"error":"invalid url! only http or https requests are accepted!"});
      }
    
      map.insert({
        "url":path,
        "id": id
      });
      db.close();
      res.json({
        "url":path,
        "id": id
      });
      
    });
    
    
  });
});

app.get("/*",function(req,res){
  mongo.connect(dburl,function(err,db){
    if(err){
      console.log("failed to connect to cloub DB!");
      res.end("failed to connect to cloub DB!");      //our data base entry is going to be {url,id}
      throw err;
    }
    
    var pathname=url.parse(req.url).pathname;
    pathname=pathname.substring(1,pathname.length);
    var id=parseInt(pathname);
    
    var map=db.collection("fcc-url-redirect");
    var cursor=map.find({"id":id});
    cursor.toArray(function(err,data){
      if(err) throw err;
      db.close();
      if(data.length!=0)
      
      res.redirect(data[0]["url"]);
      else
      res.json({
        "error" : "id not mapped!"
      });
    });
    
  });
});

app.listen(port,function(){
  console.log("app is listening on port "+port);
});