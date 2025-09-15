'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Toolbar,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import DashboardLayout from '@/components/DashboardLayout';
import { formatApiError, NotificationState } from '@/utils/api-error-handler';
import { PersonV2Dto, PersonV2ResponseDto, EnderecoDto } from '@/types/api-types';

// Importando o service
import { PersonService } from '@/services/person-service';

// Dados iniciais vazios
const initialRows: PersonV2ResponseDto[] = [];

export default function PessoasCrud() {
  const [rows, setRows] = React.useState<PersonV2ResponseDto[]>(initialRows);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create');
  const [loading, setLoading] = React.useState(false);
  const [currentPerson, setCurrentPerson] = React.useState<PersonV2Dto>({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: new Date().toISOString().split('T')[0],
    sexo: '',
    nacionalidade: '',
    naturalidade: '',
    endereco: {
      rua: '',
      numero: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notification, setNotification] = React.useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Buscar pessoas ao carregar o componente
  React.useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const data = await PersonService.getAllPersons();
      // Ensure the data is correctly typed as PersonV2ResponseDto[]
      setRows(data as PersonV2ResponseDto[]);
    } catch (error) {
      const errorMessage = formatApiError(error);
      setNotification({
        open: true,
        message: `Erro ao buscar pessoas: ${errorMessage}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenDialog = (mode: 'create' | 'edit', person?: PersonV2ResponseDto) => {
    setDialogMode(mode);
    if (mode === 'edit' && person) {
      // Converte PersonV2ResponseDto para PersonV2Dto para edição
      const personDto: PersonV2Dto = {
        nome: person.nome,
        cpf: person.cpf,
        email: person.email,
        dataNascimento: person.dataNascimento,
        sexo: person.sexo,
        nacionalidade: person.nacionalidade,
        naturalidade: person.naturalidade,
        endereco: {
          rua: person.endereco.rua,
          numero: person.endereco.numero,
          cidade: person.endereco.cidade,
          estado: person.endereco.estado,
          cep: person.endereco.cep
        }
      };
      setCurrentPerson(personDto);
      setEditingId(person.id);
    } else {
      // Redefine o currentPerson para um novo objeto PersonV2Dto
      setCurrentPerson({
        nome: '',
        cpf: '',
        email: '',
        dataNascimento: new Date().toISOString().split('T')[0],
        sexo: '',
        nacionalidade: '',
        naturalidade: '',
        endereco: {
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: ''
        }
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveDialog = async () => {
    setLoading(true);
    
    try {
      if (dialogMode === 'create') {
        await PersonService.createPerson(currentPerson);
        setNotification({
          open: true,
          message: 'Pessoa cadastrada com sucesso!',
          severity: 'success',
        });
      } else if (editingId !== null) {
        await PersonService.updatePerson(editingId, currentPerson);
        setNotification({
          open: true,
          message: 'Pessoa atualizada com sucesso!',
          severity: 'success',
        });
      }
      
      // Recarregar a lista
      fetchPersons();
      handleCloseDialog();
    } catch (error) {
      const errorMessage = formatApiError(error);
      setNotification({
        open: true,
        message: `Erro ao ${dialogMode === 'create' ? 'cadastrar' : 'atualizar'} pessoa: ${errorMessage}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
      setLoading(true);
      try {
        await PersonService.deletePerson(id);
        setNotification({
          open: true,
          message: 'Pessoa excluída com sucesso!',
          severity: 'success',
        });
        // Recarregar a lista
        fetchPersons();
      } catch (error) {
        const errorMessage = formatApiError(error);
        setNotification({
          open: true,
          message: `Erro ao excluir pessoa: ${errorMessage}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filtra os resultados de acordo com a busca
  const filteredRows = rows.filter(
    row =>
      row.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.email && row.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      row.cpf.includes(searchQuery)
  );

  return (
    <DashboardLayout title="Gerenciamento de Pessoas">
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Pessoas Cadastradas
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mr: 2 }}>
                <SearchIcon sx={{ position: 'absolute', left: 8, top: 8, color: 'action.active' }} />
                <TextField
                  placeholder="Pesquisar..."
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      paddingLeft: '32px',
                    },
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Adicionar
              </Button>
            </Box>
          </Toolbar>

          <TableContainer>
            <Table aria-label="tabela de pessoas">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Data de Nascimento</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredRows.map((row) => (
                      <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {row.nome}
                        </TableCell>
                        <TableCell>{row.cpf}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{new Date(row.dataNascimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{`${row.endereco.rua}, ${row.endereco.numero} - ${row.endereco.cidade}/${row.endereco.estado}`}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Editar">
                              <IconButton
                                aria-label="editar"
                                onClick={() => handleOpenDialog('edit', row)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                aria-label="excluir"
                                onClick={() => handleDelete(row.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRows.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Dialog para criar/editar pessoas */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === 'create' ? 'Adicionar Nova Pessoa' : 'Editar Pessoa'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome Completo"
              name="nome"
              value={currentPerson.nome}
              onChange={(e) => setCurrentPerson({ ...currentPerson, nome: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="cpf"
              label="CPF"
              name="cpf"
              value={currentPerson.cpf}
              onChange={(e) => setCurrentPerson({ ...currentPerson, cpf: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              value={currentPerson.email || ''}
              onChange={(e) => setCurrentPerson({ ...currentPerson, email: e.target.value })}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data de Nascimento"
                value={new Date(currentPerson.dataNascimento)}
                onChange={(newValue) => {
                  if (newValue) {
                    setCurrentPerson({ 
                      ...currentPerson, 
                      dataNascimento: newValue.toISOString().split('T')[0] 
                    });
                  }
                }}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="sexo-label">Sexo</InputLabel>
              <Select
                labelId="sexo-label"
                id="sexo"
                value={currentPerson.sexo || ''}
                label="Sexo"
                onChange={(e) => setCurrentPerson({ ...currentPerson, sexo: e.target.value })}
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="O">Outro</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="naturalidade"
              label="Naturalidade"
              name="naturalidade"
              value={currentPerson.naturalidade || ''}
              onChange={(e) => setCurrentPerson({ ...currentPerson, naturalidade: e.target.value })}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="nacionalidade"
              label="Nacionalidade"
              name="nacionalidade"
              value={currentPerson.nacionalidade || ''}
              onChange={(e) => setCurrentPerson({ ...currentPerson, nacionalidade: e.target.value })}
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Endereço
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="rua"
              label="Rua"
              name="rua"
              value={currentPerson.endereco.rua}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  rua: e.target.value 
                } 
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="numero"
              label="Número"
              name="numero"
              value={currentPerson.endereco.numero}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  numero: e.target.value 
                } 
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="cidade"
              label="Cidade"
              name="cidade"
              value={currentPerson.endereco.cidade}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  cidade: e.target.value 
                } 
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="estado"
              label="Estado"
              name="estado"
              value={currentPerson.endereco.estado}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  estado: e.target.value 
                } 
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="cep"
              label="CEP"
              name="cep"
              value={currentPerson.endereco.cep}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  cep: e.target.value 
                } 
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveDialog} 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notificações */}
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
    </DashboardLayout>
  );
}
