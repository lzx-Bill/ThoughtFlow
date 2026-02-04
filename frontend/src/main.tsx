import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

// 自定义主题 - 活泼风格
const theme = extendTheme({
  fonts: {
    heading: '"PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  styles: {
    global: {
      body: {
        bg: '#0f172a',
        color: 'gray.200',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(167, 139, 250, 0.4) transparent',
      },
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'rgba(167, 139, 250, 0.4)',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(167, 139, 250, 0.6)',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: '2xl',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
