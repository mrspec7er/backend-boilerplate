import postRoute from "./postRoute";
import userRoute from "./userRoute";
import utilityRoute from "./utilityRoute";

function route(app: any) {
  app.use(postRoute);
  app.use(userRoute);
  app.use(utilityRoute);
}

export default route;
