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
  Select,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import DashboardLayout from '@/components/DashboardLayout';
import { formatApiError, NotificationState } from '@/utils/api-error-handler';
import { PersonDto, PersonV2Dto, PersonResponseDto, PersonV2ResponseDto, EnderecoDto } from '@/types/api-types';

// Importando os services
import { PersonServiceV1, PersonServiceV2, PersonService } from '@/services/person-service';

// Interface combinada para exibir ambos os tipos de pessoa
interface CombinedPersonResponseDto {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  dataNascimento: string;
  sexo?: string;
  naturalidade?: string;
  nacionalidade?: string;
  dataCadastro: string;
  dataAtualizacao: string;
  endereco?: EnderecoDto;
  // Campo para indicar qual versão é
  version: 'v1' | 'v2';
}

// Dados iniciais vazios
const initialRows: CombinedPersonResponseDto[] = [];

// Função para formatar CEP no padrão 11111-111
const formatCEP = (cep: string): string => {
  // Remove todos os caracteres não numéricos
  const numericCEP = cep.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limitedCEP = numericCEP.slice(0, 8);
  
  // Adiciona o hífen se tiver pelo menos 6 dígitos
  if (limitedCEP.length > 5) {
    return `${limitedCEP.slice(0, 5)}-${limitedCEP.slice(5)}`;
  }
  
  return limitedCEP;
};

// Função para remover formatação do CEP (mantém apenas números)
const stripCEP = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

// Função para formatar CPF no padrão 123.456.789-00
const formatCPF = (cpf: string): string => {
  // Remove todos os caracteres não numéricos
  const numericCPF = cpf.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedCPF = numericCPF.slice(0, 11);
  
  // Adiciona os pontos e o hífen se tiver dígitos suficientes
  if (limitedCPF.length > 9) {
    return `${limitedCPF.slice(0, 3)}.${limitedCPF.slice(3, 6)}.${limitedCPF.slice(6, 9)}-${limitedCPF.slice(9)}`;
  } else if (limitedCPF.length > 6) {
    return `${limitedCPF.slice(0, 3)}.${limitedCPF.slice(3, 6)}.${limitedCPF.slice(6)}`;
  } else if (limitedCPF.length > 3) {
    return `${limitedCPF.slice(0, 3)}.${limitedCPF.slice(3)}`;
  }
  
  return limitedCPF;
};

// Função para remover formatação do CPF (mantém apenas números)
const stripCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '').slice(0, 11);
};

// Função para garantir que as datas estejam em formato UTC
const ensureUTCDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  // Criar uma nova data UTC explicitamente com os componentes de data local
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  );
  return utcDate.toISOString();
};

export default function PessoasCrud() {
  const [rows, setRows] = React.useState<CombinedPersonResponseDto[]>(initialRows);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create');
  const [loading, setLoading] = React.useState(false);
  const [currentPerson, setCurrentPerson] = React.useState<PersonV2Dto>({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toISOString(),
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
  const [includeAddress, setIncludeAddress] = React.useState(true);
  const [counters, setCounters] = React.useState({
    totalV1: 0,
    totalV2: 0
  });
  
  // Cálculo do total de registros
  const totalRecords = counters.totalV1 + counters.totalV2;
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
      // Buscar pessoas de ambas as versões da API
      const [personsV1, personsV2] = await Promise.all([
        PersonServiceV1.getAllPersons(),
        PersonServiceV2.getAllPersons()
      ]);
      
      // Converter PersonResponseDto para CombinedPersonResponseDto
      const v1Processed = personsV1.map(person => ({
        ...person,
        endereco: undefined,  // Pessoa v1 não tem endereço
        version: 'v1' as const
      }));
      
      // Converter PersonV2ResponseDto para CombinedPersonResponseDto
      const v2Processed = personsV2.map(person => ({
        ...person,
        // Garantir que o endereço esteja definido
        endereco: person.endereco || {
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: ''
        },
        version: 'v2' as const
      }));
      
      // Combinar os resultados
      const combinedData: CombinedPersonResponseDto[] = [...v1Processed, ...v2Processed];
      
      // Ordenar por data de cadastro (mais recente primeiro)
      combinedData.sort((a, b) => 
        new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()
      );
      
      // Atualizar contadores
      setCounters({
        totalV1: personsV1.length,
        totalV2: personsV2.length
      });
      
      setRows(combinedData);
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

  const handleOpenDialog = (mode: 'create' | 'edit', person?: CombinedPersonResponseDto) => {
    setDialogMode(mode);
    if (mode === 'edit' && person) {
      // Verifica se a pessoa tem endereço preenchido e/ou é uma pessoa V2
      const isV2 = person.version === 'v2';
      const hasAddress = person.endereco && 
        (person.endereco.rua || person.endereco.numero || 
         person.endereco.cidade || person.endereco.estado || 
         person.endereco.cep);
      
      // Configurar checkbox de incluir endereço
      setIncludeAddress(!!hasAddress);
      
      // Prepara dados para edição
      const personDto: PersonV2Dto = {
        nome: person.nome,
        cpf: formatCPF(person.cpf),
        email: person.email || '',
        dataNascimento: ensureUTCDate(person.dataNascimento),
        sexo: person.sexo || '',
        nacionalidade: person.nacionalidade || '',
        naturalidade: person.naturalidade,
        endereco: person.endereco ? {
          rua: person.endereco.rua || '',
          numero: person.endereco.numero || '',
          cidade: person.endereco.cidade || '',
          estado: person.endereco.estado || '',
          // CEP já é armazenado no formato numérico
          cep: person.endereco.cep || ''
        } : {
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: ''
        }
      };
      setCurrentPerson(personDto);
      setEditingId(person.id);
    } else {
      // Para nova pessoa, inicializa includeAddress como false
      setIncludeAddress(false);
      
      // Redefine o currentPerson para um novo objeto PersonV2Dto
      setCurrentPerson({
        nome: '',
        cpf: '',
        email: '',
        dataNascimento: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toISOString(),
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
      // Campos básicos para ambas as versões
      const basePersonData: PersonDto = {
        nome: currentPerson.nome,
        cpf: stripCPF(currentPerson.cpf),
        email: currentPerson.email,
        dataNascimento: ensureUTCDate(currentPerson.dataNascimento),
        sexo: currentPerson.sexo,
        naturalidade: currentPerson.naturalidade,
        nacionalidade: currentPerson.nacionalidade
      };
      
      if (dialogMode === 'create') {
        if (includeAddress) {
          // Criar uma PessoaV2 (com endereço)
          const personV2Data: PersonV2Dto = {
            ...basePersonData,
            endereco: {
              rua: currentPerson.endereco?.rua || '',
              numero: currentPerson.endereco?.numero || '',
              cidade: currentPerson.endereco?.cidade || '',
              estado: currentPerson.endereco?.estado || '',
              cep: stripCEP(currentPerson.endereco?.cep || '')
            }
          };
          
          await PersonServiceV2.createPerson(personV2Data);
        } else {
          // Criar uma Pessoa (sem endereço)
          await PersonServiceV1.createPerson(basePersonData);
        }
        
        setNotification({
          open: true,
          message: 'Pessoa cadastrada com sucesso!',
          severity: 'success',
        });
      } else if (editingId !== null) {
        // Para atualizações, verificamos qual versão estava sendo editada
        const personToEdit = rows.find(p => p.id === editingId);
        
        if (personToEdit?.version === 'v1' && !includeAddress) {
          // Atualizar uma Pessoa V1
          await PersonServiceV1.updatePerson(editingId, basePersonData);
        } else if (personToEdit?.version === 'v2' && includeAddress) {
          // Atualizar uma Pessoa V2
          const personV2Data: PersonV2Dto = {
            ...basePersonData,
            endereco: {
              rua: currentPerson.endereco?.rua || '',
              numero: currentPerson.endereco?.numero || '',
              cidade: currentPerson.endereco?.cidade || '',
              estado: currentPerson.endereco?.estado || '',
              cep: stripCEP(currentPerson.endereco?.cep || '')
            }
          };
          
          await PersonServiceV2.updatePerson(editingId, personV2Data);
        } else if (personToEdit?.version === 'v1' && includeAddress) {
          // Converter de V1 para V2 (criar novo e excluir antigo)
          const personV2Data: PersonV2Dto = {
            ...basePersonData,
            endereco: {
              rua: currentPerson.endereco?.rua || '',
              numero: currentPerson.endereco?.numero || '',
              cidade: currentPerson.endereco?.cidade || '',
              estado: currentPerson.endereco?.estado || '',
              cep: stripCEP(currentPerson.endereco?.cep || '')
            }
          };
          
          await PersonServiceV2.createPerson(personV2Data);
          await PersonServiceV1.deletePerson(editingId);
        } else if (personToEdit?.version === 'v2' && !includeAddress) {
          // Converter de V2 para V1 (criar novo e excluir antigo)
          await PersonServiceV1.createPerson(basePersonData);
          await PersonServiceV2.deletePerson(editingId);
        }
        
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

  const handleDelete = async (id: number, version: 'v1' | 'v2') => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
      setLoading(true);
      try {
        // Usar o serviço adequado de acordo com a versão
        if (version === 'v1') {
          await PersonServiceV1.deletePerson(id);
        } else {
          await PersonServiceV2.deletePerson(id);
        }
        
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
            <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'baseline' }}>
              <Typography
                variant="h6"
                id="tableTitle"
                component="div"
                sx={{ mr: 2 }}
              >
                Pessoas Cadastradas
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                ({totalRecords} registros: {counters.totalV1} sem endereço, {counters.totalV2} com endereço)
              </Typography>
            </Box>

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
                        <TableCell>{formatCPF(row.cpf)}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{new Date(row.dataNascimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          {row.endereco && (row.endereco.rua || row.endereco.numero || row.endereco.cidade || row.endereco.estado) ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <HomeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              {`${row.endereco.rua || '-'}, ${row.endereco.numero || '-'} - ${row.endereco.cidade || '-'}/${row.endereco.estado || '-'}`}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              Sem endereço cadastrado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Editar">
                              <IconButton
                                aria-label="editar"
                                onClick={() => {
                                  // Garantir que row.endereco exista antes de editar
                                  const safeRow = row.endereco ? row : {
                                    ...row,
                                    endereco: {
                                      rua: '',
                                      numero: '',
                                      cidade: '',
                                      estado: '',
                                      cep: ''
                                    }
                                  };
                                  handleOpenDialog('edit', safeRow as CombinedPersonResponseDto);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                aria-label="excluir"
                                onClick={() => handleDelete(row.id, row.version)}
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
              onChange={(e) => setCurrentPerson({ ...currentPerson, cpf: formatCPF(e.target.value) })}
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
                      dataNascimento: ensureUTCDate(newValue.toISOString())
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
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={includeAddress}
                    onChange={(e) => setIncludeAddress(e.target.checked)}
                    color="primary"
                    icon={<HomeIcon fontSize="small" />}
                    checkedIcon={<HomeIcon fontSize="small" />}
                  />
                }
                label="Incluir endereço"
              />
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box 
              sx={{ 
                mt: 1, 
                mb: 1, 
                p: 2, 
                border: '1px solid',
                borderColor: includeAddress ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                backgroundColor: includeAddress ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: includeAddress ? 'primary.main' : 'text.secondary' }}>
                <HomeIcon sx={{ mr: 1 }} />
                Endereço
              </Typography>
            
            <TextField
              margin="normal"
              required={includeAddress}
              fullWidth
              id="rua"
              label="Rua"
              name="rua"
              disabled={!includeAddress}
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
              required={includeAddress}
              fullWidth
              id="numero"
              label="Número"
              name="numero"
              disabled={!includeAddress}
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
              required={includeAddress}
              fullWidth
              id="cidade"
              label="Cidade"
              name="cidade"
              disabled={!includeAddress}
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
              required={includeAddress}
              fullWidth
              id="estado"
              label="Estado"
              name="estado"
              disabled={!includeAddress}
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
              required={includeAddress}
              fullWidth
              id="cep"
              label="CEP"
              name="cep"
              disabled={!includeAddress}
              placeholder="11111-111"
              inputProps={{ maxLength: 9 }}
              value={formatCEP(currentPerson.endereco.cep || '')}
              onChange={(e) => setCurrentPerson({ 
                ...currentPerson, 
                endereco: { 
                  ...currentPerson.endereco, 
                  cep: e.target.value 
                } 
              })}
            />
            </Box>
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
