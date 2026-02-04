import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

interface SignupResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiService.login(email, password);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('Login failed');
      }
      return response.data as LoginResponse;
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      mobileNumber,
      password,
    }: {
      name: string;
      email: string;
      mobileNumber: string;
      password: string;
    }) => {
      const response = await apiService.signup(name, email, mobileNumber, password);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('Signup failed');
      }
      return response.data as SignupResponse;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiService.logout();
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiService.refreshToken();
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('Token refresh failed');
      }
      return response.data;
    },
  });
};
