import axiosClient from '../api/axiosClient';

export const listingService = {
  async getListings(params = {}) {
    const cleanParams = {};
    if (params.search) cleanParams.search = params.search;
    if (params.category && params.category !== 'ALL') cleanParams.category = params.category;
    if (params.sort) cleanParams.sort = params.sort;
    if (params.status) cleanParams.status = params.status;

    const response = await axiosClient.get('/listings', { params: cleanParams });
    return response.data;
  },

  async getFeaturedListings() {
    const response = await axiosClient.get('/listings/featured');
    return response.data;
  },

  async getMyListings() {
    const response = await axiosClient.get('/listings/my');
    return response.data;
  },

  async getListingById(id) {
    const response = await axiosClient.get(`/listings/${id}`);
    return response.data;
  },

  async createListing(listingData) {
    const response = await axiosClient.post('/listings', listingData);
    return response.data;
  },

  async updateListing(id, listingData) {
    const response = await axiosClient.put(`/listings/${id}`, listingData);
    return response.data;
  },

  async deleteListing(id) {
    const response = await axiosClient.delete(`/listings/${id}`);
    return response.data;
  },

  async markAsSold(id) {
    const response = await axiosClient.patch(`/listings/${id}/sold`);
    return response.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  async sendInquiry(listingId, inquiryData) {
    const response = await axiosClient.post(`/listings/${listingId}/inquiries`, inquiryData);
    return response.data;
  },
};
