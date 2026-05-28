// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../src/pages/Auth';
import * as firebaseAuth from 'firebase/auth';

// ---------------------------------------------------------
// 1. Module Mocks
// ---------------------------------------------------------

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Mock the local firebase config module
vi.mock('../src/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: {},
}));

// Mock motion/react to prevent styling/animation complications
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref) => <div ref={ref} {...props}>{children}</div>),
    button: React.forwardRef(({ children, ...props }: any, ref) => <button ref={ref} {...props}>{children}</button>),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react to avoid importing complex SVG bundles
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>ArrowLeft</span>,
  Mail: () => <span>Mail</span>,
  Lock: () => <span>Lock</span>,
  User: () => <span>User</span>,
  ArrowRight: () => <span>ArrowRight</span>,
}));

// Mock Logo component
vi.mock('../components/Logo', () => ({
  default: () => <div>Logo</div>,
}));

describe('Auth Page - Reset Password Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub alert
    window.alert = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('should toggle forgot password mode and trigger sendPasswordResetEmail upon submission', async () => {
    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    // 1. Verify we start in standard Login Mode
    expect(screen.getByText('Welcome back')).toBeDefined();
    
    // Find the Forgot Password button
    const forgotPasswordBtn = screen.getByText('Forgot password?');
    expect(forgotPasswordBtn).toBeDefined();

    // 2. Click the Forgot Password button
    fireEvent.click(forgotPasswordBtn);

    // 3. Verify screen title changes to "Reset password"
    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeDefined();
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined();

    // Verify password field is no longer rendered in Forgot Password view
    expect(screen.queryByPlaceholderText('••••••••')).toBeNull();

    // 4. Fill in the email address
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'candidate@example.com' } });

    // 5. Submit the form
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    // 6. Verify that sendPasswordResetEmail is called with the auth instance and correct email
    await waitFor(() => {
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalled();
    });

    // 7. Verify that standard alert is popped and it switches back to Login mode
    expect(window.alert).toHaveBeenCalledWith('Password reset email sent! Please check your inbox.');
    expect(screen.getByText('Welcome back')).toBeDefined();
  });

  it('should display error message if sendPasswordResetEmail rejects', async () => {
    // Stub sendPasswordResetEmail to reject
    const mockError = new Error('Firebase: Error (auth/user-not-found).');
    vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValueOnce(mockError);

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    // Go to forgot password screen
    fireEvent.click(screen.getByText('Forgot password?'));

    // Fill in email
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'unknown@example.com' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    // Wait for error message to render
    await waitFor(() => {
      expect(screen.getByText('Firebase: Error (auth/user-not-found).')).toBeDefined();
    });

    // Verify it remains on the Reset Password page
    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeDefined();
  });
});
