const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL)

const connection = mongoose.connection;

connection.on("connected", () => {
    console.log("MongoDB Connection is Successful");
});

connection.on("error", (error) => {
    console.log("Error in MongoDB connection", error);
});

module.exports = mongoose;

module.exports = {
    devServer: {
        setupMiddlewares: (middlewares, devServer) => {
            return middlewares;
        },
    },
};
