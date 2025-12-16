import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";

export class TransactionService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  createTransaction = async (
    body: CreateTransactionDTO,
    authUserId: number
  ) => {
    const { eventId, qty } = body;

    return this.prisma.$transaction(async (tx) => {
      // 1. cek event ada atau tidak
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new ApiError("Event tidak ditemukan", 400);
      }

      // 2. cek tanggal event sudah lewat atau belum
      const now = new Date();
      if (event.date < now) {
        throw new ApiError("Event sudah lewat", 400);
      }

      // 3. cek seat cukup atau tidak
      if (event.availableSeat < qty) {
        throw new ApiError("Seat tidak mencukupi", 400);
      }

      // 4. create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: authUserId,
          eventId: event.id,
          qty,
          price: event.price,
          status: "WAITING_FOR_PAYMENT",
        },
      });

      // 5. decrement availableSeat
      await tx.event.update({
        where: { id: event.id },
        data: {
          availableSeat: {
            decrement: qty,
          },
        },
      });

      return transaction;
    });
  };

  uploadPaymentProof = async () => {};

  acceptTransaction = async () => {};

  rejectTransaction = async () => {};
}
