import { sign } from "jsonwebtoken";
import { ApiError } from "../../utils/api-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { ResetPasswordDTO } from "./dto/forgot-password.dto";
import { MailService } from "../mail/mail.service";

export class AuthService {
  prisma: PrismaService;
  mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.mailService = new MailService();
  }

  register = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) throw new ApiError("email already exist", 400);

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    return { message: "register success" };
  };

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) throw new ApiError("Invalid credentials", 400);

    const isPasswordMatch = await comparePassword(body.password, user.password);

    if (!isPasswordMatch) throw new ApiError("Invalid credentials", 400);

    const payload = { id: user.id };
    const accessToken = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken };
  };

  forgotPassword = async (body: ResetPasswordDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) throw new ApiError("User not found", 404);

    const payload = { id: user.id };
    const accessToken = sign(payload, process.env.JWT_SECRET_RESET!, {
      expiresIn: "15m",
    });

    await this.mailService.sendEmail(
      body.email,
      "Forgot Password",
      "forgot-password",
      {
        resetUrl: `http://localhost:3000/reset-password/${accessToken}`,
      }
    );

    return { message: "send email success" };
  };
}
