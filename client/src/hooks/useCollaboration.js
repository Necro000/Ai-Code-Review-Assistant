import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

export default function useCollaboration(reviewId) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    if (!reviewId || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect directly to the backend server
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    const initials = user.name
      ? user.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

    socket.on('connect', () => {
      socket.emit('join-review', {
        reviewId,
        userName: user.name || 'Anonymous User',
        initials,
      });
    });

    socket.on('collaborators-list', (users) => {
      setCollaborators(users);
    });

    socket.on('collaborator-joined', (newUser) => {
      setCollaborators((prev) => {
        if (prev.some(u => u.userId === newUser.userId)) return prev;
        return [...prev, newUser];
      });
    });

    socket.on('collaborator-left', ({ userId }) => {
      setCollaborators((prev) => prev.filter(u => u.userId !== userId));
    });

    return () => {
      socket.emit('leave-review', { reviewId });
      socket.disconnect();
    };
  }, [reviewId, user]);

  return collaborators;
}
