import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resolveWsUrl } from '@/lib/api';
import { getStoredAccessToken } from '@/lib/auth-storage';
import { isRecordLike } from '@/lib/errors';
import { ChatMessageDto } from '@/services/live-chat';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type LiveChatSocketMeta = {
  success?: boolean;
  status?: string;
  detail?: string;
};

type LiveChatSocketPayload = {
  meta?: LiveChatSocketMeta;
  data?: unknown;
  status?: string;
  detail?: string;
};

function getMessageId(message: Partial<ChatMessageDto>) {
  return message.id ?? `${message.conversation_id}-${message.timestamp}-${message.content}`;
}

function shouldIgnoreSystemJoinMessage(message: Partial<ChatMessageDto>) {
  const senderId = String(message.sender_id ?? '');
  const content = String(message.content ?? '').toLowerCase();

  if (senderId !== 'System') {
    return false;
  }

  return content.includes('joined to chat room') || content.includes('joined chat room');
}

function isChatMessageDto(value: unknown): value is ChatMessageDto {
  return isRecordLike(value);
}

function parseSocketPayload(raw: string): LiveChatSocketPayload | null {
  const parsed: unknown = JSON.parse(raw);

  if (!isRecordLike(parsed)) {
    return null;
  }

  let meta: LiveChatSocketMeta | undefined;

  if (isRecordLike(parsed.meta)) {
    meta = {};

    if (typeof parsed.meta.success === 'boolean') {
      meta.success = parsed.meta.success;
    }

    if (typeof parsed.meta.status === 'string') {
      meta.status = parsed.meta.status;
    }

    if (typeof parsed.meta.detail === 'string') {
      meta.detail = parsed.meta.detail;
    }

    if (Object.keys(meta).length === 0) {
      meta = undefined;
    }
  }

  return {
    ...(meta ? { meta } : {}),
    ...('data' in parsed ? { data: parsed.data } : {}),
    ...(typeof parsed.status === 'string' ? { status: parsed.status } : {}),
    ...(typeof parsed.detail === 'string' ? { detail: parsed.detail } : {}),
  };
}

export function useLiveChatSocket(chatId?: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessageDto[]>([]);

  const wsUrl = useMemo(() => {
    if (!chatId) {
      return null;
    }

    return resolveWsUrl(`/live_chat/room/${chatId}`);
  }, [chatId]);

  useEffect(() => {
    let disposed = false;

    setLiveMessages([]);
    setLastError(null);

    if (!chatId || !wsUrl) {
      setConnectionStatus('idle');
      return;
    }

    const socketUrl = wsUrl;

    async function connect() {
      const accessToken = await getStoredAccessToken();

      if (!accessToken || disposed) {
        setConnectionStatus('idle');
        return;
      }

      setConnectionStatus('connecting');

      const socket = new WebSocket(socketUrl, ['access_token', accessToken]);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          return;
        }

        setConnectionStatus('connected');
        setLastError(null);
      };

      socket.onmessage = (event) => {
        try {
          const payload = parseSocketPayload(String(event.data));

          if (!payload) {
            setLastError('Não foi possível interpretar a mensagem recebida.');
            return;
          }

          if (payload.meta?.success && isChatMessageDto(payload.data)) {
            const message = payload.data;

            if (shouldIgnoreSystemJoinMessage(message)) {
              return;
            }

            setLiveMessages((current) => {
              const nextId = getMessageId(message);

              if (current.some((item) => getMessageId(item) === nextId)) {
                return current;
              }

              return [...current, message];
            });

            return;
          }

          if (payload.meta?.success === false || payload.status) {
            setLastError(
              payload.detail ?? payload.meta?.detail ?? 'Erro na conexão em tempo real.',
            );
          }
        } catch {
          setLastError('Não foi possível interpretar a mensagem recebida.');
        }
      };

      socket.onerror = () => {
        if (disposed) {
          return;
        }

        setConnectionStatus('error');
        setLastError('Falha na conexão WebSocket.');
      };

      socket.onclose = () => {
        if (disposed) {
          return;
        }

        setConnectionStatus('disconnected');
      };
    }

    void connect();

    return () => {
      disposed = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [chatId, wsUrl]);

  const sendMessage = useCallback((content: string) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setLastError('Conexão em tempo real indisponível.');
      return false;
    }

    socket.send(
      JSON.stringify({
        type: 'text',
        content,
      }),
    );

    return true;
  }, []);

  return {
    connectionStatus,
    liveMessages,
    sendMessage,
    lastError,
  };
}
