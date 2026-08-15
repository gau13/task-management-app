import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProtected = () =>
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    renderProtected();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders content for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: { _id: '1', name: 'Test', email: 'test@test.com', role: 'user' },
      isLoading: false,
      isAuthenticated: true,
    });

    renderProtected();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    renderProtected();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
