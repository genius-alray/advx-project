export interface Message {
  id: string;
  sender: "user" | "ai";
  senderId: string;
  type: "text" | "voice";
  content: string;
}
