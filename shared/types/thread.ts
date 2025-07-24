import type { Message } from "./message";

export interface Thread {
  id: string;
  userId: string;
  roleId: string;
  title: string;
  content: Message[];
}
