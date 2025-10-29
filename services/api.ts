
import { User, Company, Client, Employee, Func, DailyRate, PaymentBatch } from '../types';

const createApi = <T extends { id: number }>(key: string, initialData: T[] = []) => {
  let data: T[] = JSON.parse(localStorage.getItem(key) || 'null') || initialData;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  const saveData = (newData: T[]) => {
    data = newData;
    localStorage.setItem(key, JSON.stringify(data));
  };

  return {
    getAll: async (): Promise<T[]> => {
      data = JSON.parse(localStorage.getItem(key) || 'null') || [];
      return [...data];
    },
    getById: async (id: number): Promise<T | undefined> => {
      data = JSON.parse(localStorage.getItem(key) || 'null') || [];
      return data.find(item => item.id === id);
    },
    create: async (itemData: Omit<T, 'id'>): Promise<T> => {
      data = JSON.parse(localStorage.getItem(key) || 'null') || [];
      const newId = data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1;
      const newItem = { ...itemData, id: newId } as T;
      saveData([...data, newItem]);
      return newItem;
    },
    update: async (id: number, itemData: Partial<Omit<T, 'id'>>): Promise<T> => {
      data = JSON.parse(localStorage.getItem(key) || 'null') || [];
      let updatedItem: T | undefined;
      const newData = data.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...itemData };
          return updatedItem;
        }
        return item;
      });
      if (!updatedItem) throw new Error('Item not found');
      saveData(newData);
      return updatedItem;
    },
    remove: async (id: number): Promise<void> => {
      data = JSON.parse(localStorage.getItem(key) || 'null') || [];
      const newData = data.filter(item => item.id !== id);
      if (newData.length === data.length) throw new Error('Item not found');
      saveData(newData);
    },
  };
};

const createPaymentBatchApi = (key: string, initialData: PaymentBatch[] = []) => {
    let data: PaymentBatch[] = JSON.parse(localStorage.getItem(key) || 'null') || initialData;
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    const saveData = (newData: PaymentBatch[]) => {
        data = newData;
        localStorage.setItem(key, JSON.stringify(data));
    };
    
    return {
        getAll: async (): Promise<PaymentBatch[]> => {
            data = JSON.parse(localStorage.getItem(key) || 'null') || [];
            return [...data];
        },
        getById: async (id: string): Promise<PaymentBatch | undefined> => {
            data = JSON.parse(localStorage.getItem(key) || 'null') || [];
            return data.find(item => item.id === id);
        },
        create: async (itemData: Omit<PaymentBatch, 'id'>): Promise<PaymentBatch> => {
            data = JSON.parse(localStorage.getItem(key) || 'null') || [];
            const newItem = { ...itemData, id: crypto.randomUUID() } as PaymentBatch;
            saveData([...data, newItem]);
            return newItem;
        },
        update: async (id: string, itemData: Partial<Omit<PaymentBatch, 'id'>>): Promise<PaymentBatch> => {
            data = JSON.parse(localStorage.getItem(key) || 'null') || [];
            let updatedItem: PaymentBatch | undefined;
            const newData = data.map(item => {
                if (item.id === id) {
                    updatedItem = { ...item, ...itemData };
                    return updatedItem;
                }
                return item;
            });
            if (!updatedItem) throw new Error('Item not found');
            saveData(newData);
            return updatedItem;
        },
        remove: async (id: string): Promise<void> => {
            data = JSON.parse(localStorage.getItem(key) || 'null') || [];
            const newData = data.filter(item => item.id !== id);
            if (newData.length === data.length) throw new Error('Item not found');
            saveData(newData);
        },
    }
}


const initialUsers: User[] = [
    { id: 1, nome: 'Admin', email: 'admin@gestao.com', role: 'admin', status: 'ativo' },
    { id: 2, nome: 'Operador', email: 'operador@gestao.com', role: 'operador', status: 'ativo' }
];

export const usersApi = createApi<User>('users', initialUsers);
export const companiesApi = createApi<Company>('companies');
export const clientsApi = createApi<Client>('clients');
export const employeesApi = createApi<Employee>('employees');
export const funcsApi = createApi<Func>('funcs');
export const dailyRatesApi = createApi<DailyRate>('dailyRates');
export const paymentBatchesApi = createPaymentBatchApi('paymentBatches');


export const restoreBackup = (backupData: any) => {
  Object.keys(backupData).forEach(key => {
      if (key !== 'backupDate' && backupData[key]) {
        localStorage.setItem(key, JSON.stringify(backupData[key]));
      }
  });
};
