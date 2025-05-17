import { 
  Box, 
  Typography, 
  Avatar,
  alpha
} from '@mui/material';

/**
 * Activity item component for displaying activity feed entries
 * 
 * @param {string} action - The activity action (e.g., "Document Upload")
 * @param {string} details - Additional details about the activity
 * @param {string} date - Time/date of the activity
 * @param {string} icon - Emoji or icon character
 * @param {string} color - MUI color name (primary, secondary, etc.)
 */
const ActivityItem = ({ action, details, date, icon, color = 'primary' }) => {
  return (
    <Box sx={{ 
      py: 1.5, 
      display: 'flex', 
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Avatar 
        sx={{ 
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.2),
          color: (theme) => theme.palette[color].main,
          width: 40,
          height: 40,
          mr: 2
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" fontWeight="medium">
          {action}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {details}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
    </Box>
  );
};

export default ActivityItem;