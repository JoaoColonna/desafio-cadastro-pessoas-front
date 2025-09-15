'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chart from '@mui/icons-material/ShowChart';
import People from '@mui/icons-material/People';
import Assignment from '@mui/icons-material/Assignment';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DashboardLayout from '@/components/DashboardLayout';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
          {/* Card com Total de Pessoas */}
          <Item elevation={3}>
            <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography component="h2" variant="h4" color="primary" gutterBottom>
              237
            </Typography>
            <Typography variant="h6">
              Total de Pessoas
            </Typography>
          </Item>
          
          {/* Card com Cadastros Recentes */}
          <Item elevation={3}>
            <Assignment sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography component="h2" variant="h4" color="secondary" gutterBottom>
              28
            </Typography>
            <Typography variant="h6">
              Cadastros Recentes
            </Typography>
          </Item>
          
          {/* Card com Taxa de Crescimento */}
          <Item elevation={3}>
            <Chart sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography component="h2" variant="h4" color="success.main" gutterBottom>
              +12%
            </Typography>
            <Typography variant="h6">
              Taxa de Crescimento
            </Typography>
          </Item>
        </Box>
          
        {/* Área de Informações */}
        <Paper sx={{ p: 3 }} elevation={3}>
          <Typography variant="h5" gutterBottom>
            Bem-vindo ao Sistema de Cadastro de Pessoas
          </Typography>
          <Typography variant="body1" paragraph>
            Este é o painel de controle onde você pode gerenciar todos os cadastros de pessoas no sistema.
            Utilize o menu lateral para navegar entre as diferentes seções.
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Link href="/dashboard/pessoas" underline="none">
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.main', 
                color: 'white',
                borderRadius: 1,
                '&:hover': { bgcolor: 'primary.dark' }
              }}>
                Gerenciar Pessoas
              </Box>
            </Link>
          </Stack>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
