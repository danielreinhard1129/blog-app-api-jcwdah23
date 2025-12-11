import { Router } from "express";
import { validateBody } from "../../middlewares/validation.middleware";
import { AuthController } from "./auth.controller";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { ResetPasswordDTO } from "./dto/forgot-password.dto";

export class AuthRouter {
  router: Router;
  authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/register",
      validateBody(RegisterDTO),
      this.authController.register
    );
    this.router.post(
      "/login",
      validateBody(LoginDTO),
      this.authController.login
    );
    this.router.post(
      "/forgot-password",
      validateBody(ResetPasswordDTO),
      this.authController.forgotPassword
    );
  };

  getRouter = () => {
    return this.router;
  };
}
