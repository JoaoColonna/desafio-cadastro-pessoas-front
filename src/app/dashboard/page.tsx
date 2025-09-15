'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import People from '@mui/icons-material/People';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import DashboardLayout from '@/components/DashboardLayout';
import { PersonService } from '@/services/person-service';
import { formatApiError } from '@/utils/api-error-handler';

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
  const [totalPeople, setTotalPeople] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTotalPeople = async () => {
      try {
        setLoading(true);
        const responsePersonV1= await PersonService.getAllPersons();
        const responsePersonV2= await PersonService.getAllPersons();
        const response = [...responsePersonV1, ...responsePersonV2];
        setTotalPeople(response.length);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados de pessoas');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPeople();
  }, []);
  
  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {/* Card com Total de Pessoas */}
          <Item elevation={3} sx={{ width: '100%', maxWidth: '400px' }}>
            <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Typography component="h2" variant="h4" color="primary" gutterBottom>
                {totalPeople !== null ? totalPeople : '-'}
              </Typography>
            )}
            <Typography variant="h6">
              Total de Pessoas
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
