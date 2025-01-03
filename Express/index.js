import express from 'express';

const app = express();

const port = 3000;

app.get('/', (req, res) => {
    res.send("welcome to express class!");
});

app.get('/about', (req, res) => {
    res.send("This is about page");
});

app.listen(port, () => {
    console.log(`listening on port ${port}...`);
})