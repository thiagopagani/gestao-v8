import axios from 'axios';
import { User, Company, Client, Employee, Func, DailyRate, PaymentBatch } from '../types';

// Configure axios to automatically handle the /api prefix
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for session cookies
});

// Generic CRUD factory for models with numeric IDs
const createApi = <T extends { id: number | string }>(resource: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      const response = await apiClient.get<T[]>(`/${resource}`);
      return response.data;
    },
    getById: async (id: number): Promise<T> => {
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

// Generic CRUD factory for models with string/UUID IDs
const createApiWithStringId = <T extends { id: string }>(resource: string) => {
    return {
      getAll: async (): Promise<T[]> => {
        const response = await apiClient.get<T[]>(`/${resource}`);
        return response.data;
      },
      getById: async (id: string): Promise<T> => {
        const response = await apiClient.get<T>(`/${resource}/${id}`);
        return response.data;
      },
      create: async (itemData: Omit<T, 'id'>): Promise<T> => {
        const response = await apiClient.post<T>(`/${resource}`, itemData);
        return response.data;
      },
      update: async (id: string, itemData: Partial<Omit<T, 'id'>>): Promise<T> => {
        const response = await apiClient.put<T>(`/${resource}/${id}`, itemData);
        return response.data;
      },
      remove: async (id: string): Promise<void> => {
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
export const paymentBatchesApi = createApiWithStringId<PaymentBatch>('payment-batches');


// This function is now effectively deprecated as restore is a backend concern.
export const restoreBackup = (backupData: any) => {
  console.warn("This restore function only works for localStorage and is deprecated.");
  // The actual restore should be an API call to a backend endpoint.
};

// Auth is handled by the backend
export const authApi = {
  login: async (credentials: {email: string, password: string}): Promise<User> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  me: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};