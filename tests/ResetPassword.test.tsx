// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../src/pages/ResetPassword';
import * as firebaseAuth from 'firebase/auth';

// ---------------------------------------------------------
// 1. Module Mocks
// ---------------------------------------------------------

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  verifyPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

// Mock the local firebase config module
vi.mock('../src/firebase', () => ({
  auth: { currentUser: null },
}));

// Mock motion/react to prevent styling/animation complications
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref) => <div ref={ref} {...props}>{children}</div>),
  },
}));

// Mock lucide-react to avoid importing complex SVG bundles
vi.mock('lucide-react', () => ({
  Lock: () => <span>Lock</span>,
  ArrowRight: () => <span>ArrowRight</span>,
  ArrowLeft: () => <span>ArrowLeft</span>,
  CheckCircle2: () => <span>CheckCircle2</span>,
  AlertCircle: () => <span>AlertCircle</span>,
  RefreshCw: () => <span>RefreshCw</span>,
}));

// Mock Logo component
vi.mock('../components/Logo', () => ({
  default: () => <div>Logo</div>,
}));

describe('ResetPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should show error if oobCode query param is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    // Verification loading is triggered then error displays
    await waitFor(() => {
      expect(screen.getByText('Link Verification Failed')).toBeDefined();
      expect(screen.getByText(/Missing password reset code/i)).toBeDefined();
    });
  });

  it('should show error if verifyPasswordResetCode rejects', async () => {
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockRejectedValueOnce(new Error('Firebase: Error (auth/invalid-action-code).'));

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=badCode']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Link Verification Failed')).toBeDefined();
      expect(screen.getByText('Firebase: Error (auth/invalid-action-code).')).toBeDefined();
    });
  });

  it('should render form with user email on successful code verification', async () => {
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockResolvedValueOnce('student@example.com');

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=goodCode']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Choose new password')).toBeDefined();
      expect(screen.getByText('student@example.com')).toBeDefined();
    });

    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('should show error if passwords do not match or are too short', async () => {
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockResolvedValueOnce('student@example.com');

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=goodCode']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Choose new password')).toBeDefined();
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Reset Password/i });

    // Test case 1: password too short
    fireEvent.change(passwordInputs[0], { target: { value: '123' } });
    fireEvent.change(passwordInputs[1], { target: { value: '123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Password must be at least 8 characters long.')).toBeDefined();

    // Test case 2: passwords do not match
    fireEvent.change(passwordInputs[0], { target: { value: 'newpassword123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'differentpassword' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Passwords do not match.')).toBeDefined();
  });

  it('should submit successfully, show success screen, and auto-redirect', async () => {
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockResolvedValueOnce('student@example.com');
    vi.mocked(firebaseAuth.confirmPasswordReset).mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=goodCode']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Choose new password')).toBeDefined();
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Reset Password/i });

    // Use fake timers locally
    vi.useFakeTimers();

    fireEvent.change(passwordInputs[0], { target: { value: 'validPassword123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'validPassword123!' } });
    fireEvent.click(submitBtn);

    // Resolve confirmPasswordReset and trigger the setTimeout
    await vi.runAllTimersAsync();

    expect(firebaseAuth.confirmPasswordReset).toHaveBeenCalledWith(expect.any(Object), 'goodCode', 'validPassword123!');
    expect(screen.getByText('Password Updated!')).toBeDefined();
    expect(screen.getByText(/Your password has been reset successfully/i)).toBeDefined();

    // Verify redirect called
    expect(mockNavigate).toHaveBeenCalledWith('/auth');

    vi.useRealTimers();
  });
});
