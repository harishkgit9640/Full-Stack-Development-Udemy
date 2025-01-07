import dotenv from 'dotenv';
import connectDB from '../database/index.js';
import app from './app.js';

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`server listening on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(`server error: ${err}`)
    })