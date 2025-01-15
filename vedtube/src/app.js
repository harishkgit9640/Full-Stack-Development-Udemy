import express from 'express';
import cookieParser from 'cookie-parser';
// import { errorHandler } from '../middlewares/error.middlewares.js'
const app = express();
import cors from 'cors';

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
)

// common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser());
// app.use(errorHandler)



// import routes
import healthCheckRouter from '../routers/healthcheck.routes.js'
import userRouter from '../routers/user.routes.js'
import playListRouter from '../routers/playlist.routes.js'
import commentRouter from '../routers/comment.routes.js'


// routes
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/playlist", playListRouter)
app.use("/api/v1/comment", commentRouter)

export default app
