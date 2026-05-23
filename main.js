const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const img_router=require("./routes/images.js");
const ind=require("./routes/index_page.js");

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", ind);
app.use("/image", img_router);
app.listen(PORT, () => {
    console.log(`Server Established at PORT -> ${PORT}`);
});