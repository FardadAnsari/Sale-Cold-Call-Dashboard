import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from './api';

const useUser = () => {
  const authToken = sessionStorage.getItem('authToken');

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/user/info`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      return data;
    },
    enabled: !!authToken, // ensures the query runs only if token exists
  });
};

export default useUser;