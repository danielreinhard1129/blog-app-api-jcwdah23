import { checkExpiredTransactionScheduler } from "./expired-transaction";

export const initScheduler = () => {
  // add more scheduler here
  checkExpiredTransactionScheduler();
};
