export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isStreaming?: boolean;
}

export enum OrbState {
  Idle = 'idle',
  Listening = 'listening',
  Thinking = 'thinking',
  Speaking = 'speaking',
}