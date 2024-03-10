const mongoose=require('mongoose');
const mongoURI="mongodb+srv://ilvshishir:Shishir%40123@cluster0.vymophk.mongodb.net/inotebook"
const connectToMongo = () =>{
    mongoose.connect(mongoURI).then(() => {
        console.log("Connected to Mongo");
    })
    .catch((error) => {
        console.log(error);
        console.log("Connection failed");
    })
    

}
module.exports=connectToMongo;