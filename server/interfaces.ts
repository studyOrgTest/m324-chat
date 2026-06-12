import { WebSocket } from 'ws';

export interface User {
  id: string;
  name: string;
  ws?: WebSocket;
}

export interface Message {
  type: 'newUser' | 'message' | 'activeUsers' | 'typing';
  user?: User;
  users?: User[];
  message?: string;
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
  flush: () => void;
}
