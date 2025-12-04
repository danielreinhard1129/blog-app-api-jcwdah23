import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../utils/password";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";

export class AuthService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
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
}
