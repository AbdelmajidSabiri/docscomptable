import { Box, Typography } from '@mui/material';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
      >
        &copy; {year} DocsCompta. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;