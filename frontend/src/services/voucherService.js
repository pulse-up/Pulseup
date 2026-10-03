import api from '../api/api';

const voucherService = {
  async getMyProgress() {
    const response = await api.get('/vouchers/me/progress');

    return response.data;
  },

  async getMyVouchers() {
    const response = await api.get('/vouchers/me');

    return Array.isArray(response.data) ? response.data : [];
  },
};

export default voucherService;
