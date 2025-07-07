import React from 'react';
import { AuditLogResponseDto } from '../../types/audit.types';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

interface AuditLogListProps {
  logs: AuditLogResponseDto[];
}

const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  return (
    <List>
      {logs.map((log) => (
        <ListItem divider key={log.id}>
          <ListItemText
            primary={`${log.eventType} on ${log.entityType} ${log.entityId}`}
            secondary={
              <>
                <Typography variant="body2" color="textSecondary">
                  {new Date(log.actionTimestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">User: {log.userId}</Typography>
                <Typography variant="body2">Details: {JSON.stringify(log.newValues)}</Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AuditLogList;