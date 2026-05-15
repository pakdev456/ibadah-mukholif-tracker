import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import violationsRouter from "./violations";
import studentsRouter from "./students";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(violationsRouter);
router.use(studentsRouter);
router.use(dashboardRouter);

export default router;
