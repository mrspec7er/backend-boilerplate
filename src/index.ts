import express from "express";
import routes from "../router";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

routes(app);

app.listen(PORT, () =>
  console.log(
    `
🚀 Server ready at: http://localhost:` + PORT
  )
);
