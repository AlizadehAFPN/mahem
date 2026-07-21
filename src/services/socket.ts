import {io, Socket} from 'socket.io-client';
import store from '../stateManager';
import {domainName} from './axios-config';

let socket: Socket | null = null;
let connectedForToken: string | undefined;

// Singleton connection to the chat/notifications gateway, re-established
// whenever the access token changes (login, token refresh, logout).
export function getSocket(): Socket | null {
  const {token} = store.getState().user;
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
      connectedForToken = undefined;
    }
    return null;
  }

  if (socket && connectedForToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(`${domainName}/chat`, {
    auth: {token},
    transports: ['websocket'],
  });
  connectedForToken = token;
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectedForToken = undefined;
  }
}
