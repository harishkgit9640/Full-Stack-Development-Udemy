import express from "express"
const port = process.env.PORT || 3000
app = express();
app.listen(port, (req, res) => {
    console.log("server is listening at port localhost:" + port);
})