'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { AuthService } from '@/services/auth-service';
import { RegisterDto } from '@/types/api-types';
import { ApiError, formatApiError, NotificationState } from '@/utils/api-error-handler';

const RegisterCard = styled(Card)(({ theme }) => ({
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

const RegisterContainer = styled(Stack)(({ theme }) => ({
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

export default function Register() {
  const router = useRouter();
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<NotificationState>({
    open: false,
    message: '',
    severity: 'error',
  });

  const validateInputs = () => {
    const name = document.getElementById('name') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;

    let isValid = true;

    if (!name?.value) {
      setNameError(true);
      setNameErrorMessage('Nome de usuário é obrigatório');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email?.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Por favor, insira um endereço de e-mail válido');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password?.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('A senha deve ter pelo menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!confirmPassword?.value || confirmPassword.value !== password?.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('As senhas não coincidem');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
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
    
    const registerData: RegisterDto = {
      username: data.get('name') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
    };
    
    setLoading(true);
    
    try {
      await AuthService.register(registerData);
      setNotification({
        open: true,
        message: 'Cadastro realizado com sucesso! Redirecionando para o login...',
        severity: 'success',
      });
      
      // Redirecionar para o login após um breve delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
    <RegisterContainer direction="column" justifyContent="space-between">
      <RegisterCard variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <PersonAddIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ width: '100%', fontSize: 'clamp(1.8rem, 5vw, 2.15rem)', mb: 2 }}
        >
          Cadastre-se
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="name">Nome de Usuário</FormLabel>
            <TextField
              required
              fullWidth
              id="name"
              placeholder="Seu nome de usuário"
              name="name"
              autoComplete="username"
              autoFocus
              error={nameError}
              helperText={nameErrorMessage}
              color={nameError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">E-mail</FormLabel>
            <TextField
              required
              fullWidth
              id="email"
              placeholder="seu@email.com"
              name="email"
              autoComplete="email"
              error={emailError}
              helperText={emailErrorMessage}
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Senha</FormLabel>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="new-password"
              error={passwordError}
              helperText={passwordErrorMessage}
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              placeholder="••••••"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              error={confirmPasswordError}
              helperText={confirmPasswordErrorMessage}
              color={confirmPasswordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" />}
            label="Quero receber atualizações por e-mail"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Já tem uma conta?{' '}
            <Link href="/auth/login" variant="body2" sx={{ fontWeight: 'bold' }}>
              Faça login
            </Link>
          </Typography>
        </Box>
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
      </RegisterCard>
    </RegisterContainer>
  );
}
