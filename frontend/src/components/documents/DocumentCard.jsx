import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  alpha
} from '@mui/material';

/**
 * A modern document card component that transforms on hover from white to black
 * with additional information and actions revealed.
 * 
 * @param {Object} document - The document object containing details
 * @param {string} document.id - Document ID
 * @param {string} document.title - Document title
 * @param {string} document.type - Document type (Invoice, Receipt, etc.)
 * @param {string} document.company - Company name
 * @param {string} document.date - Document date
 * @param {string} document.status - Document status (pending, processed, rejected)
 * @param {string} document.preview - Document preview image URL
 * @param {Function} onProcess - Optional callback for processing the document
 * @param {Function} onDownload - Optional callback for downloading the document
 */
const DocumentCard = ({ document, onProcess, onDownload }) => {
  const [elevation, setElevation] = useState(1);

  const handleProcessClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onProcess) {
      onProcess(document.id);
    } else {
      window.location.href = `/documents/process/${document.id}`;
    }
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownload) {
      onDownload(document.id);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: (theme) => theme.shadows[10],
          backgroundColor: 'black',
          color: 'white',
          '& .document-overlay': {
            opacity: 1
          },
          '& .document-actions': {
            opacity: 1,
            transform: 'translateY(0)'
          },
          '& .document-info': {
            opacity: 0
          },
          '& .document-hover-info': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
      component={Link}
      to={`/documents/view/${document.id}`}
      onMouseOver={() => setElevation(3)}
      onMouseOut={() => setElevation(1)}
      elevation={elevation}
    >
      {/* Document Preview Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${document.preview || '/api/placeholder/400/300'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 0.2
          }
        }}
      />

      {/* Overlay for hover state */}
      <Box 
        className="document-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Status Indicator - Always visible */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2
        }}
      >
        <Chip
          label={document.status}
          size="small"
          color={getStatusColor(document.status)}
          sx={{ 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.65rem',
          }}
        />
      </Box>

      {/* Normal Info - Visible by default */}
      <CardContent
        className="document-info"
        sx={{
          position: 'relative',
          zIndex: 1,
          transition: 'opacity 0.3s ease',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="subtitle1" component="h2" fontWeight="bold" noWrap>
            {document.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {document.type}
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {new Date(document.date).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" fontWeight="medium" noWrap>
            {document.company}
          </Typography>
        </Box>
      </CardContent>

      {/* Hover Info - Visible on hover */}
      <Box
        className="document-hover-info"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          color: 'white'
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {document.title}
        </Typography>
        
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" align="center">
            Type: {document.type}
          </Typography>
          <Typography variant="body2" align="center">
            Company: {document.company}
          </Typography>
          <Typography variant="body2" align="center">
            Date: {new Date(document.date).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          sx={{ 
            mt: 2,
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'white'
            }
          }}
        >
          View Document
        </Button>
      </Box>

      {/* Action buttons - Visible on hover */}
      <Box
        className="document-actions"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 1,
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        {/* Only show process button if status is pending */}
        {document.status === 'pending' && (
          <Tooltip title="Process">
            <IconButton
              size="small"
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                marginRight: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
              onClick={handleProcessClick}
            >
              ✓
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Download">
          <IconButton
            size="small"
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
            onClick={handleDownloadClick}
          >
            ⬇️
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default DocumentCard;