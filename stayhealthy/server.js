const express = require("express");
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");

app.use("/api/user", userRoute);
app.use("/api/v1/admin", require("./routes/adminRoutes"));
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Node server started at port ${port}`));

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/v1/admin", adminRoutes);




