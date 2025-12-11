import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
