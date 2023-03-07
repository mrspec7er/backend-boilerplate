import express from "express";
import routes from "../router";
import morgan from "morgan";
import cors from "cors";
import schedule from "node-schedule";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

schedule.scheduleJob("5 * * * * *", function () {
  const today = new Date();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  console.log("This function execute at: " + time);
});

schedule.scheduleJob("2 * * *", function () {
  console.log("This function execute everyday at 2am");
});

routes(app);

app.listen(PORT, () =>
  console.log(
    `
🚀 Server ready at: PORT:` + PORT
  )
);
