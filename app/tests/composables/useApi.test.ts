import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoles, useThreads, useVoices, useKnowledge } from '~/composables/useApi';

// Mock $fetch
const mockFetch = vi.fn();
global.$fetch = mockFetch;

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch roles successfully', async () => {
    const mockRoles = [
      { id: '1', name: 'Test Role', description: 'Test Description' }
    ];
    mockFetch.mockResolvedValue(mockRoles);

    const { fetchRoles } = useRoles();
    const result = await fetchRoles();

    expect(mockFetch).toHaveBeenCalledWith('/api/role/all');
    expect(result).toEqual(mockRoles);
  });

  it('should handle fetch roles error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { fetchRoles, error } = useRoles();
    const result = await fetchRoles();

    expect(result).toEqual([]);
    expect(error.value).toBe('Network error');
  });

  it('should create role successfully', async () => {
    const mockResult = { id: 'new-role-id' };
    mockFetch.mockResolvedValue(mockResult);

    const { createRole } = useRoles();
    const result = await createRole({
      name: 'New Role',
      description: 'New Description'
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/role/create', {
      method: 'POST',
      body: {
        name: 'New Role',
        description: 'New Description'
      }
    });
    expect(result).toEqual(mockResult);
  });
});

describe('useThreads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create thread successfully', async () => {
    const mockResult = { id: 'new-thread-id' };
    mockFetch.mockResolvedValue(mockResult);

    const { createThread } = useThreads();
    const result = await createThread('role-id');

    expect(mockFetch).toHaveBeenCalledWith('/api/thread/create', {
      method: 'POST',
      body: { roleId: 'role-id' }
    });
    expect(result).toEqual(mockResult);
  });

  it('should send message successfully', async () => {
    mockFetch.mockResolvedValue(undefined);

    const { sendMessage } = useThreads();
    const result = await sendMessage('thread-id', 'Hello');

    expect(mockFetch).toHaveBeenCalledWith('/api/thread/thread-id/text', {
      method: 'POST',
      body: { message: 'Hello' }
    });
    expect(result).toBe(true);
  });
});

describe('useKnowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add knowledge successfully', async () => {
    mockFetch.mockResolvedValue('Added knowledge');

    const { addKnowledge } = useKnowledge();
    const result = await addKnowledge('Test knowledge');

    expect(mockFetch).toHaveBeenCalledWith('/api/knowledge', {
      method: 'POST',
      body: { data: 'Test knowledge' }
    });
    expect(result).toBe(true);
  });

  it('should fetch knowledge successfully', async () => {
    const mockKnowledge = ['Knowledge 1', 'Knowledge 2'];
    mockFetch.mockResolvedValue(mockKnowledge);

    const { fetchKnowledge } = useKnowledge();
    const result = await fetchKnowledge();

    expect(mockFetch).toHaveBeenCalledWith('/api/knowledge');
    expect(result).toEqual(mockKnowledge);
  });
});
