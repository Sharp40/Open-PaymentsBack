import express from "express";
import cors from "cors";
import routeProducts from "./routes/product.route.js";
import routePayment from "./routes/payment.route.js";
import routerUsuarios from './routes/usaurios.route.js';

const PORT_API = process.env.PORT_API || 3000;
const IP_SERVER = process.env.IP_SERVER || "0.0.0.0";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routePayment);
app.use("/api", routeProducts);
app.use("/api/", routerUsuarios);

app.listen(PORT_API, IP_SERVER, () => {
  console.log(`Backend corriendo en http://${IP_SERVER}:${PORT_API}`);
});
