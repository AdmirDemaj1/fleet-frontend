import {
    Box,
    Typography,
    Paper,
    Avatar,
    TextField,
    Button,
    Stack,
    Divider
  } from '@mui/material';
  import { useState } from 'react';
  
  const mockComments = [
    {
      id: 1,
      admin: 'John D.',
      date: '2025-06-20 14:35',
      content: 'Reviewed contract terms with the customer and updated vehicle status.'
    },
    {
      id: 2,
      admin: 'Elisa G.',
      date: '2025-06-18 09:20',
      content: 'Called to remind about upcoming payment. Customer confirmed awareness.'
    }
  ];
  
  const CommentsPage = () => {
    const [comments, setComments] = useState(mockComments);
    const [newComment, setNewComment] = useState('');
  
    const handleAddComment = () => {
      if (!newComment.trim()) return;
  
      const comment = {
        id: comments.length + 1,
        admin: 'Current Admin', // Replace with dynamic admin info
        date: new Date().toLocaleString(),
        content: newComment.trim()
      };
  
      setComments([comment, ...comments]);
      setNewComment('');
    };
  
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Admin Comments
        </Typography>
  
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }} elevation={2}>
          <Typography variant="subtitle1" gutterBottom>
            Write a Comment
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Write your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Box mt={2}>
            <Button variant="contained" onClick={handleAddComment}>
              Add Comment
            </Button>
          </Box>
        </Paper>
  
        <Stack spacing={3}>
          {comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 3, borderRadius: 3 }} elevation={1}>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <Avatar>{comment.admin[0]}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{comment.admin}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.date}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body1" color="text.primary">
                {comment.content}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  };
  
  export default CommentsPage;