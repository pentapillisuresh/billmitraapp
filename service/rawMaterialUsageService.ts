// service/rawMaterialUsageService.js
import client from './client';

export const createRawMaterialUsage = (data:any) => {
  return client.post('/raw-material-usages', data);
};

export const getRawMaterialUsages = (params:any) => {
  return client.get('/raw-material-usages', { params });
};