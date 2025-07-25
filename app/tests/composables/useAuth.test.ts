import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '~/composables/useAuth';

// Mock dependencies
const mockFetch = vi.fn();
const mockUserSession = vi.fn();
const mockRefreshSession = vi.fn();

global.$fetch = mockFetch;
global.useUserSession = vi.fn(() => ({
  data: mockUserSession,
  refresh: mockRefreshSession
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      message: 'Login success',
      user: { id: 'user1', name: 'Test User' }
    };
    mockFetch.mockResolvedValue(mockResponse);

    const { login } = useAuth();
    const result = await login({ id: 'user1', password: 'password' });

    expect(mockFetch).toHaveBeenCalledWith('/api/user/login', {
      method: 'POST',
      body: { id: 'user1', password: 'password' }
    });
    expect(result).toBe(true);
  });

  it('should handle login error', async () => {
    mockFetch.mockRejectedValue(new Error('Invalid credentials'));

    const { login, error } = useAuth();
    const result = await login({ id: 'user1', password: 'wrong' });

    expect(result).toBe(false);
    expect(error.value).toBe('Invalid credentials');
  });

  it('should register successfully', async () => {
    const mockResponse = { message: '注册成功' };
    mockFetch.mockResolvedValue(mockResponse);

    const { register } = useAuth();
    const result = await register({
      id: 'newuser',
      name: 'New User',
      password: 'password'
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/user/register', {
      method: 'POST',
      body: {
        id: 'newuser',
        name: 'New User',
        password: 'password'
      }
    });
    expect(result).toBe(true);
  });

  it('should handle register error', async () => {
    mockFetch.mockRejectedValue(new Error('User already exists'));

    const { register, error } = useAuth();
    const result = await register({
      id: 'existinguser',
      name: 'Existing User',
      password: 'password'
    });

    expect(result).toBe(false);
    expect(error.value).toBe('User already exists');
  });
});
