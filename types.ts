export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'operador';
  status: 'ativo' | 'inativo';
}

export interface Company {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  status: 'ativo' | 'inativo';
}

export interface Client {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  empresaId: number;
  status: 'ativo' | 'inativo';
}

export interface Employee {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  funcaoId: number;
  observacoes?: string;
  status: 'ativo' | 'inativo';
}

export interface Func {
  id: number;
  nome: string;
  descricao?: string;
  status: 'ativo' | 'inativo';
}

export interface DailyRate {
  id: number;
  data: string; // YYYY-MM-DD
  funcionarioId: number;
  clienteId: number;
  valor_diaria: number;
  valor_deslocamento: number;
  valor_alimentacao: number;
  observacao?: string;
  status: 'pendente' | 'aprovado';
  paymentBatchId?: string | null;
}

export interface PaymentBatch {
    id: string;
    startDate: string;
    endDate: string;
    employeeIds: number[];
    dailyRateIds: number[];
    totalAmount: number;
    status: 'aberto' | 'pago';
    createdAt: string;
}
