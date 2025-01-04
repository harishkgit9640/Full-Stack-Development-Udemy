import express from 'express';

const app = express();

const port = 3000;

app.use(express.json());

//crud operations using express

let taskList = [];
let taskId = 1;

// TODO: post route
app.post('/add-task', (req, res) => {
    const { task, status } = req.body
    const newTask = { id: taskId++, task, status }
    taskList.push(newTask);
    res.status(200).send(taskList);
});

// TODO: get route
app.get('/get-task', (req, res) => {
    res.status(200).send(taskList);
})

// TODO: get-by-id route
app.get('/get-task/:id', (req, res) => {
    const ID = req.params.id
    const getTask = taskList.find(task => task.id === parseInt(ID));
    if (!getTask) { return res.status(404).send("Task not found!") }
    res.status(200).send(getTask);
})

// TODO: update route
app.patch('/update-task/:id', (req, res) => {
    const getTask = taskList.find(task => task.id === parseInt(req.params.id));
    if (!getTask) { return res.status(404).send("task not found!") }
    const { task, status } = req.body;
    getTask.task = task
    getTask.status = status;
    return res.status(200).send(getTask)

})

// TODO: delete route
app.delete('/delete-task/:id', (req, res) => {
    const getTask = taskList.findIndex(task => task.id === parseInt(req.params.id));
    if (getTask === -1) { return res.status(404).send("Task not found!") }
    taskList.splice(getTask, 1);
    return res.status(200).send("Task Deleted successfully")
})

app.listen(port, () => {
    console.log(`listening on port ${port}...`);
})