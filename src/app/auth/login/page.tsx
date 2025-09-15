'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { AuthService } from '@/services/auth-service';
import { LoginDto } from '@/types/api-types';
import { ApiError, formatApiError, NotificationState } from '@/utils/api-error-handler';

const LoginCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

export default function Login() {
  const router = useRouter();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<NotificationState>({
    open: false,
    message: '',
    severity: 'error',
  });

  const validateInputs = () => {
    const username = document.getElementById('username') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!username?.value) {
      setEmailError(true);
      setEmailErrorMessage('Por favor, insira seu nome de usuário.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password?.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    const data = new FormData(event.currentTarget);
    
    const loginData: LoginDto = {
      username: data.get('username') as string,
      password: data.get('password') as string,
    };
    
    setLoading(true);
    
    try {
      await AuthService.login(loginData);
      // Redirecionar para o dashboard após login bem-sucedido
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = formatApiError(error);
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer direction="column" justifyContent="space-between">
      <LoginCard variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ width: '100%', fontSize: 'clamp(1.8rem, 5vw, 2.15rem)', mb: 2 }}
        >
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="username">Nome de usuário</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="username"
              type="text"
              name="username"
              placeholder="Seu nome de usuário"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <Link href="#" variant="body2" sx={{ alignSelf: 'baseline' }}>
                Esqueceu sua senha?
              </Link>
            </Box>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar-me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Não tem uma conta?{' '}
            <Link href="/auth/register" variant="body2" sx={{ fontWeight: 'bold' }}>
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </LoginCard>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </LoginContainer>
  );
}
