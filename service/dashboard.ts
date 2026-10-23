import client from './client';

export const getHomeDashboard = (outletId: number) => {
  return client.get<any, any>(`/dashboard/home/${outletId}`, {
  });
};