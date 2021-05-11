module.exports = {
    local_db: "mongodb://localhost:27017/explorehub",
    // online_db:
    //   "mongodb+srv://ionic-angular-db:ionic-angular-db@cluster0.pzv9e.mongodb.net/ionic-angular-db?retryWrites=true&w=majority",

    online_db: "mongodb://ionic-angular-db:ionic-angular-db@cluster0-shard-00-00.pzv9e.mongodb.net:27017,cluster0-shard-00-01.pzv9e.mongodb.net:27017,cluster0-shard-00-02.pzv9e.mongodb.net:27017/ionic-angular-db?ssl=true&replicaSet=atlas-i3x8dw-shard-0&authSource=admin&retryWrites=true&w=majority"
};