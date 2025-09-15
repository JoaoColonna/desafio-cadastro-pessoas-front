// Para evitar problemas com SSR, usamos uma função para criar o tema
'use client';

import { createTheme } from '@mui/material/styles';
import { blue, pink } from '@mui/material/colors';

// Cria um tema customizado para a aplicação
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: pink[500],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
          },
        },
      },
    },
  },
});

export default theme;
