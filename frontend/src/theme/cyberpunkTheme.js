import { createTheme } from '@mui/material/styles';

const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f9ff', // Cyan neon
      light: '#80fcff',
      dark: '#00c8cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff0096', // Pink neon
      light: '#ff80ca',
      dark: '#c6006d',
      contrastText: '#000000',
    },
    background: {
      default: '#0b0b18',
      paper: '#12121f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a7a7c5',
    },
    error: {
      main: '#ff5252',
    },
    warning: {
      main: '#ffcb00',
    },
    success: {
      main: '#00ff9f',
    },
    divider: 'rgba(255, 0, 150, 0.2)',
  },
  typography: {
    fontFamily: "'Rajdhani', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h3: {
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
    button: {
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Rajdhani';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/rajdhani/v10/LDI2apCSOBg7S-QT7pcYnON0.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Orbitron';
          font-style: normal;
          font-display: swap;
          font-weight: 700;
          src: url(https://fonts.gstatic.com/s/orbitron/v19/yMJWMIlzdpvBhQQL_QIAUjh2qtk.woff2) format('woff2');
        }
        body {
          background-color: #0b0b18;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(0, 249, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 0, 150, 0.05) 0%, transparent 50%);
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background-color: #12121f;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #00f9ff;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #00c8cc;
        }
      `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(90deg, #12121f 0%, #1a1a2e 100%)',
          boxShadow: '0 0 15px rgba(0, 249, 255, 0.2)',
          borderBottom: '1px solid rgba(0, 249, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2), rgba(255,255,255,0) 70%)',
            transform: 'translateX(-100%)',
            transition: 'all 0.3s ease-out',
          },
          '&:hover::after': {
            transform: 'translateX(100%)',
          },
          textTransform: 'uppercase',
          letterSpacing: '1px',
        },
        contained: {
          boxShadow: '0 0 10px rgba(0, 249, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 249, 255, 0.5)',
          },
        },
        containedPrimary: {
          border: '1px solid rgba(0, 249, 255, 0.5)',
          textShadow: '0 0 5px rgba(0, 249, 255, 0.5)',
        },
        containedSecondary: {
          border: '1px solid rgba(255, 0, 150, 0.5)',
          textShadow: '0 0 5px rgba(255, 0, 150, 0.5)',
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
        outlinedPrimary: {
          boxShadow: '0 0 10px rgba(0, 249, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 0 15px rgba(0, 249, 255, 0.4)',
          },
        },
        outlinedSecondary: {
          boxShadow: '0 0 10px rgba(255, 0, 150, 0.2)',
          '&:hover': {
            boxShadow: '0 0 15px rgba(255, 0, 150, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(18, 18, 31, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderRadius: 4,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
          borderRight: '1px solid rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23), 0 0 10px rgba(0, 249, 255, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 249, 255, 0.8), transparent)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00f9ff',
              boxShadow: '0 0 8px rgba(0, 249, 255, 0.5)',
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 249, 255, 0.05)',
            boxShadow: 'inset 0 0 8px rgba(0, 249, 255, 0.1)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #00f9ff, #ff0096)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          '&.Mui-selected': {
            color: '#ffffff',
            textShadow: '0 0 5px rgba(0, 249, 255, 0.5)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        outlinedPrimary: {
          borderColor: 'rgba(0, 249, 255, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 249, 255, 0.05)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        barColorPrimary: {
          background: 'linear-gradient(90deg, #00f9ff, #00c8cc)',
          boxShadow: '0 0 8px rgba(0, 249, 255, 0.5)',
        },
        barColorSecondary: {
          background: 'linear-gradient(90deg, #ff0096, #c6006d)',
          boxShadow: '0 0 8px rgba(255, 0, 150, 0.5)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid rgba(0, 249, 255, 0.3)',
          boxShadow: '0 0 10px rgba(0, 249, 255, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(18, 18, 31, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(135deg, rgba(18, 18, 31, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%)',
          boxShadow: '0 15px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 249, 255, 0.3)',
          border: '1px solid rgba(0, 249, 255, 0.2)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          opacity: 0.2,
        },
      },
    },
  },
});

export default cyberpunkTheme;