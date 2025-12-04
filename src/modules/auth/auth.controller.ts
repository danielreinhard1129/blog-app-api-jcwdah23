import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    return res.status(200).send(result);
  };
}
