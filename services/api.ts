import axios from 'axios';
import { User, Company, Client, Employee, Func, DailyRate, PaymentBatch } from '../types';

// Configure axios to automatically handle the /api prefix
const apiClient = axios.create({
  baseURL: '/api',
});

const createApi = <T extends { id: number | string }>(resource: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      const response = await apiClient.get<T[]>(`/${resource}`);
      return response.data;
    },
    getById: async (id: number | string): Promise<T> => {
      const response = await apiClient.get<T>(`/${resource}/${id}`);
      return response.data;
    },
    create: async (itemData: Omit<T, 'id'>): Promise<T> => {
      const response = await apiClient.post<T>(`/${resource}`, itemData);
      return response.data;
    },
    update: async (id: number | string, itemData: Partial<Omit<T, 'id'>>): Promise<T> => {
      const response = await apiClient.put<T>(`/${resource}/${id}`, itemData);
      return response.data;
    },
    remove: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/${resource}/${id}`);
    },
  };
};


export const usersApi = createApi<User>('users');
export const companiesApi = createApi<Company>('companies');
export const clientsApi = createApi<Client>('clients');
export const employeesApi = createApi<Employee>('employees');
export const funcsApi = createApi<Func>('funcs');
export const dailyRatesApi = createApi<DailyRate>('daily-rates');
export const paymentBatchesApi = createApi<PaymentBatch>('payment-batches');

// The restore backup function is now a backend responsibility. 
// This can be kept for a potential "local mode" or removed.
// For now, we'll keep it but it's not used in the main flow.
export const restoreBackup = (backupData: any) => {
  console.warn("Restore backup is a local-only function and does not affect the server.");
  Object.keys(backupData).forEach(key => {
      if (key !== 'backupDate' && backupData[key]) {
        localStorage.setItem(key, JSON.stringify(backupData[key]));
      }
  });
};

// Auth is now handled by the backend
export const authApi = {
  login: async (credentials: {email: string, password: string}): Promise<User> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  }
};
