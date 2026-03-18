import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_PORT = 3001;
const CONNECT_TIMEOUT_MS = 2500;

let socket = null;
let connectedServerUrl = '';
let connectPromise = null;

const buildServerCandidates = () => {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const host = window.location.hostname || 'localhost';

    const candidates = [
        `${protocol}://${host}:${SOCKET_PORT}`,
        `${protocol}://localhost:${SOCKET_PORT}`,
        `${protocol}://127.0.0.1:${SOCKET_PORT}`
    ];

    return [...new Set(candidates)];
};

const createSocket = (url) => io(url, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    timeout: CONNECT_TIMEOUT_MS,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 3000
});

const connectWithFallback = () => {
    if (socket?.connected) {
        return Promise.resolve(socket);
    }

    if (connectPromise) {
        return connectPromise;
    }

    const candidates = buildServerCandidates();

    connectPromise = new Promise((resolve, reject) => {
        let index = 0;

        const tryNext = () => {
            if (index >= candidates.length) {
                connectPromise = null;
                reject(new Error('All socket server candidates failed'));
                return;
            }

            const candidateUrl = candidates[index];
            index += 1;
            const candidateSocket = createSocket(candidateUrl);

            let settled = false;

            const clear = () => {
                candidateSocket.off('connect', onConnect);
                candidateSocket.off('connect_error', onError);
            };

            const timer = window.setTimeout(() => {
                if (settled) return;
                settled = true;
                clear();
                candidateSocket.close();
                tryNext();
            }, CONNECT_TIMEOUT_MS + 300);

            const onConnect = () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                clear();

                socket = candidateSocket;
                connectedServerUrl = candidateUrl;
                connectPromise = null;
                resolve(socket);
            };

            const onError = () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                clear();
                candidateSocket.close();
                tryNext();
            };

            candidateSocket.once('connect', onConnect);
            candidateSocket.once('connect_error', onError);
        };

        tryNext();
    });

    return connectPromise;
};

export function useGameState() {
    const [gameState, setGameState] = useState(null);
    const [connectionError, setConnectionError] = useState('');
    const [activeServerUrl, setActiveServerUrl] = useState('');

    useEffect(() => {
        let isCancelled = false;
        let retryTimer = null;
        let cleanupStateSync = null;
        let cleanupReconnect = null;

        const connectAndSync = async () => {
            try {
                const connectedSocket = await connectWithFallback();
                if (isCancelled) return;

                setConnectionError('');
                setActiveServerUrl(connectedServerUrl);

                const handleStateSync = (state) => {
                    setGameState(state);
                };

                connectedSocket.on('stateSync', handleStateSync);
                connectedSocket.emit('requestState');

                cleanupStateSync = () => {
                    connectedSocket.off('stateSync', handleStateSync);
                };

                const handleReconnect = () => {
                    connectedSocket.emit('requestState');
                };

                connectedSocket.on('reconnect', handleReconnect);
                cleanupReconnect = () => {
                    connectedSocket.off('reconnect', handleReconnect);
                };
            } catch {
                if (isCancelled) return;
                setConnectionError('无法连接到服务端 3001 端口，请确认 server 已启动。');
                retryTimer = window.setTimeout(connectAndSync, 2000);
            }
        };

        connectAndSync();

        return () => {
            isCancelled = true;
            if (retryTimer) {
                window.clearTimeout(retryTimer);
            }
            cleanupStateSync?.();
            cleanupReconnect?.();
        };
    }, []);

    const updateState = (newState) => {
        if (!socket) {
            setConnectionError('当前未连接服务端，状态更新失败。');
            return;
        }
        socket.emit('updateState', newState);
        // 乐观更新机制，确保本地体验极速
        setGameState(newState);
    };

    return { gameState, updateState, socket, connectionError, activeServerUrl };
}
