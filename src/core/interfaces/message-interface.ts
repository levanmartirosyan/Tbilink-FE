export interface SendMessageRequest {
  recipientId: number;
  content: string;
}
export interface MessageDto {
  id: number;
  senderId: number;
  senderName?: string;
  recipientId?: number;
  content: string;
  messageSent: string;
  dateRead?: string | null;
}

export interface ChatParticipantDto {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  profilePhotoUrl: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}
