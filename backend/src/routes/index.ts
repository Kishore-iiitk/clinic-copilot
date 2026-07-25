import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import aiRouter from "./ai";
import simulationRouter from "./simulation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(aiRouter);
router.use(simulationRouter);

export default router;
