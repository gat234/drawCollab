const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const img_router=require("./routes/images.js");
const usr=require("./routes/usr.js");
const ind=require("./routes/index_page.js");
const session = require("express-session");
const bodyParser = require('body-parser');
const webSckServ = require("./websocket.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "c6310b6d",
    saveUninitialized: true,
    resave: true
}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", ind);
app.use("/", usr);
app.use("/", img_router);
app.listen(PORT, () => {
    console.log(`Server Established at PORT -> ${PORT}`);
});