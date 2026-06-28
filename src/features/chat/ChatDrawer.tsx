import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Person,
  ContentCopy,
  Check,
  AddCircleOutline,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../shared/utils/api';

const DRAWER_WIDTH = 460;

const SUGGESTED_PROMPTS = [
  'How many active contracts do we have?',
  'Show me all overdue payments',
  'What are the current EURIBOR rates?',
  'List customers with contracts expiring this month',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setInput('');
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post<{ response: string; sessionId: string }>('/chat', {
        message: trimmed,
        sessionId: sessionId ?? undefined,
      });

      setSessionId(data.sessionId);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const status = error?.response?.status;
      const errorText =
        status === 400
          ? 'Please enter a valid message.'
          : status === 401
          ? 'Session expired. Please log in again.'
          : 'Something went wrong. Please try again.';

      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isDark = theme.palette.mode === 'dark';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: DRAWER_WIDTH },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
        },
      }}
      sx={{ zIndex: theme.zIndex.drawer + 2 }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
        }}
      >
        <SmartToy sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
          AI Assistant
        </Typography>
        <Tooltip title="New conversation">
          <IconButton
            size="small"
            onClick={handleNewChat}
            disabled={isLoading}
            sx={{ color: theme.palette.text.secondary }}
          >
            <AddCircleOutline fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SmartToy
                sx={{
                  fontSize: 48,
                  color: alpha(theme.palette.primary.main, 0.5),
                  mb: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Ask me anything about contracts, payments, customers, vehicles, or EURIBOR rates.
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Suggested questions
            </Typography>
            <Stack spacing={1}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  onClick={() => sendMessage(prompt)}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 'auto',
                    py: 0.75,
                    px: 0.5,
                    borderRadius: 1.5,
                    justifyContent: 'flex-start',
                    '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
                    cursor: 'pointer',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    bgcolor: isUser
                      ? '#1a56db'
                      : alpha(theme.palette.secondary.main, 0.15),
                    mt: 0.25,
                  }}
                >
                  {isUser ? (
                    <Person sx={{ fontSize: 16 }} />
                  ) : (
                    <SmartToy sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                  )}
                </Avatar>

                <Box sx={{ maxWidth: '80%', minWidth: 0 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      backgroundColor: isUser
                        ? '#1a56db'
                        : isDark
                        ? alpha(theme.palette.action.selected, 0.8)
                        : alpha(theme.palette.grey[100], 1),
                      color: isUser ? '#ffffff' : theme.palette.text.primary,
                      '& *': isUser ? { color: '#ffffff' } : {},
                      position: 'relative',
                    }}
                  >
                    {isUser ? (
                      <Box
                        component="p"
                        sx={{ m: 0, wordBreak: 'break-word', fontSize: '0.875rem', lineHeight: 1.6, color: '#ffffff' }}
                      >
                        {msg.content}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          '& p': { m: 0, mb: 0.75, '&:last-child': { mb: 0 }, fontSize: '0.875rem', lineHeight: 1.6 },
                          '& ul, & ol': { mt: 0.5, mb: 0.75, pl: 2.5, fontSize: '0.875rem' },
                          '& li': { mb: 0.25 },
                          '& strong': { fontWeight: 600 },
                          '& code': {
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                          },
                          '& pre': {
                            backgroundColor: isDark ? alpha('#000', 0.4) : alpha(theme.palette.grey[900], 0.05),
                            borderRadius: 1,
                            p: 1.5,
                            overflowX: 'auto',
                            my: 0.75,
                            '& code': { backgroundColor: 'transparent', p: 0 },
                          },
                          '& table': {
                            borderCollapse: 'collapse',
                            width: '100%',
                            fontSize: '0.8rem',
                            my: 0.75,
                          },
                          '& th, & td': {
                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            px: 1,
                            py: 0.5,
                            textAlign: 'left',
                          },
                          '& th': { fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                          '& h1, & h2, & h3': { mt: 1, mb: 0.5, fontWeight: 600 },
                          '& blockquote': {
                            borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                            ml: 0,
                            pl: 1.5,
                            color: theme.palette.text.secondary,
                          },
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </Box>
                    )}
                  </Box>

                  <Stack
                    direction={isUser ? 'row-reverse' : 'row'}
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 0.5, px: 0.5 }}
                  >
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                      {formatTime(msg.timestamp)}
                    </Typography>
                    {!isUser && (
                      <Tooltip title={copiedId === msg.id ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          sx={{ p: 0.25, color: theme.palette.text.disabled, '&:hover': { color: theme.palette.text.secondary } }}
                        >
                          {copiedId === msg.id ? (
                            <Check sx={{ fontSize: 13 }} />
                          ) : (
                            <ContentCopy sx={{ fontSize: 13 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              </Box>
            );
          })
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                bgcolor: alpha(theme.palette.secondary.main, 0.15),
              }}
            >
              <SmartToy sx={{ fontSize: 16, color: theme.palette.primary.main }} />
            </Avatar>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: '12px 12px 12px 4px',
                backgroundColor: isDark
                  ? alpha(theme.palette.action.selected, 0.8)
                  : alpha(theme.palette.grey[100], 1),
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <CircularProgress size={12} thickness={5} />
              <Typography variant="caption" color="text.secondary">
                Thinking…
              </Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input area */}
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              width: 38,
              height: 38,
              flexShrink: 0,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3), color: '#fff' },
            }}
          >
            <Send fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: 'block', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line
        </Typography>
      </Box>
    </Drawer>
  );
};
