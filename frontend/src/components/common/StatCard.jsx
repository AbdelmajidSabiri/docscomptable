import { useState } from 'react';
import { 
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  alpha
} from '@mui/material';

/**
 * A modern stat card component with an icon, value, and title.
 * The card elevates on hover with a smooth transition.
 * 
 * @param {string} icon - Emoji or icon character to display
 * @param {string|number} value - The main value to display
 * @param {string} title - Description of what the value represents
 * @param {string} color - MUI color name (primary, secondary, error, etc.)
 * @param {Object} sx - Additional MUI sx prop styles
 */
const StatCard = ({ icon, value, title, color = 'primary', sx = {} }) => {
  const [elevation, setElevation] = useState(1);

  return (
    <Card
      elevation={elevation}
      onMouseOver={() => setElevation(4)}
      onMouseOut={() => setElevation(1)}
      sx={{
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
        ...sx
      }}
    >
      <CardContent sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            backgroundColor: (theme) => alpha(theme.palette[color].main, 0.2),
            color: (theme) => theme.palette[color].main,
            mb: 2,
            fontSize: '1.5rem'
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;