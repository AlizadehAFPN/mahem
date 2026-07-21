import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useQueryClient} from 'react-query';
import {RootState} from '../../stateManager';
import {getSocket, disconnectSocket} from '../../services/socket';

// Renders nothing — just keeps one socket connection alive for the whole
// app lifetime (for live notification badge updates) and tears it down on
// logout. Chat screens reuse the same connection via getSocket().
export function SocketBridge() {
  const token = useSelector((s: RootState) => s.user.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const onNotificationNew = () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-badge']);
    };
    socket.on('notification:new', onNotificationNew);
    return () => {
      socket.off('notification:new', onNotificationNew);
    };
  }, [token, queryClient]);

  return null;
}
