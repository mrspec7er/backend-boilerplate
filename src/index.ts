import express from "express";
import routes from "../router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes(app);

app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000`)
);
