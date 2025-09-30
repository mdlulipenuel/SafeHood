// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  isProfessional: boolean;
  joinDate: Date;
  reportsSubmitted: number;
  communityScore: number;
  subscriptionStatus: 'basic' | 'premium' | 'professional';
  subscriptionExpiry?: Date;
  emailVerified: boolean;
  identityVerified: boolean;
  verificationDate?: Date;
  verificationConfidence?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface PasswordResetData {
  email: string;
}

// Mock user database (in production, this would be a real API)
const MOCK_USERS: AuthUser[] = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    isPremium: false,
    isProfessional: false,
    joinDate: new Date('2025-01-15'),
    reportsSubmitted: 12,
    communityScore: 95,
    subscriptionStatus: 'basic',
    emailVerified: true,
    identityVerified: true,
    verificationDate: new Date('2025-01-15'),
    verificationConfidence: 0.85
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    isPremium: true,
    isProfessional: false,
    joinDate: new Date('2024-11-20'),
    reportsSubmitted: 28,
    communityScore: 98,
    subscriptionStatus: 'premium',
    subscriptionExpiry: new Date('2026-01-20'),
    emailVerified: true,
    identityVerified: true,
    verificationDate: new Date('2024-11-20'),
    verificationConfidence: 0.92
  },
  {
    id: 'user3',
    email: 'admin@safehood.com',
    name: 'SafeHood Admin',
    isPremium: true,
    isProfessional: true,
    joinDate: new Date('2024-09-01'),
    reportsSubmitted: 156,
    communityScore: 100,
    subscriptionStatus: 'professional',
    subscriptionExpiry: new Date('2026-09-01'),
    emailVerified: true,
    identityVerified: true,
    verificationDate: new Date('2024-09-01'),
    verificationConfidence: 0.98
  }
];

// Storage keys
const STORAGE_KEYS = {
  AUTH_USER: 'safehood_auth_user',
  AUTH_TOKEN: 'safehood_auth_token',
  REMEMBER_ME: 'safehood_remember_me'
};

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadStoredAuth();
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  private updateState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  // Load authentication from storage
  private loadStoredAuth(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        user.joinDate = new Date(user.joinDate);
        if (user.subscriptionExpiry) {
          user.subscriptionExpiry = new Date(user.subscriptionExpiry);
        }
        
        this.updateState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearStoredAuth();
    }
  }

  // Store authentication data
  private storeAuth(user: AuthUser, token: string, rememberMe: boolean = false): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    }
  }

  // Clear stored authentication
  private clearStoredAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.authState;
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.authState.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Login
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    this.updateState({ loading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock database
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!user) {
        this.updateState({ loading: false, error: 'User not found' });
        return { success: false, error: 'Invalid email or password' };
      }

      // In production, you would verify the password hash
      if (credentials.password.length < 6) {
        this.updateState({ loading: false, error: 'Invalid password' });
        return { success: false, error: 'Invalid email or password' };
      }

      // Generate mock token
      const token = `token_${user.id}_${Date.now()}`;

      // Store authentication
      this.storeAuth(user, token, credentials.rememberMe);

      this.updateState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: 'Login failed. Please try again.' 
      });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Signup
  async signup(signupData: SignupData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    this.updateState({ loading: true, error: null });

    try {
      // Validate data
      if (signupData.password !== signupData.confirmPassword) {
        this.updateState({ loading: false, error: 'Passwords do not match' });
        return { success: false, error: 'Passwords do not match' };
      }

      if (signupData.password.length < 6) {
        this.updateState({ loading: false, error: 'Password must be at least 6 characters' });
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (!signupData.agreeToTerms) {
        this.updateState({ loading: false, error: 'You must agree to terms and conditions' });
        return { success: false, error: 'You must agree to terms and conditions' };
      }

      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === signupData.email.toLowerCase());
      if (existingUser) {
        this.updateState({ loading: false, error: 'Email already registered' });
        return { success: false, error: 'Email already registered' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new user
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: signupData.email,
        name: signupData.name,
        isPremium: false,
        isProfessional: false,
        joinDate: new Date(),
        reportsSubmitted: 0,
        communityScore: 50,
        subscriptionStatus: 'basic',
        emailVerified: false,
        identityVerified: false
      };

      // Add to mock database
      MOCK_USERS.push(newUser);

      // Generate token and store
      const token = `token_${newUser.id}_${Date.now()}`;
      this.storeAuth(newUser, token);

      this.updateState({
        isAuthenticated: true,
        user: newUser,
        loading: false,
        error: null
      });

      return { success: true, user: newUser };
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: 'Signup failed. Please try again.' 
      });
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  // Update user verification status
  async updateUserVerification(userId: string, verified: boolean, confidence?: number): Promise<boolean> {
    try {
      const userIndex = MOCK_USERS.findIndex(user => user.id === userId);
      if (userIndex === -1) return false;

      MOCK_USERS[userIndex].identityVerified = verified;
      if (verified) {
        MOCK_USERS[userIndex].verificationDate = new Date();
        MOCK_USERS[userIndex].verificationConfidence = confidence || 0.8;
      }

      // Update current user if it's the same
      const currentUser = this.getCurrentUser();
      if (currentUser?.id === userId) {
        this.updateState({
          user: { ...MOCK_USERS[userIndex] },
          isAuthenticated: true,
          loading: false,
          error: null
        });
      }

      return true;
    } catch (error) {
      console.error('Verification update failed:', error);
      return false;
    }
  }

  // Logout
  logout(): void {
    this.clearStoredAuth();
    this.updateState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  }

  // Password reset
  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    this.updateState({ loading: true, error: null });

    try {
      // Check if user exists
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      
      if (!user) {
        this.updateState({ loading: false, error: 'Email not found' });
        return { success: false, error: 'Email not found' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.updateState({ loading: false, error: null });
      return { success: true };
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: 'Password reset failed. Please try again.' 
      });
      return { success: false, error: 'Password reset failed. Please try again.' };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    this.updateState({ loading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedUser = { ...this.authState.user, ...updates };
      
      // Update in mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === updatedUser.id);
      if (userIndex >= 0) {
        MOCK_USERS[userIndex] = updatedUser;
      }

      // Update stored auth
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.storeAuth(updatedUser, token);
      }

      this.updateState({
        user: updatedUser,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: 'Profile update failed. Please try again.' 
      });
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  }

  // Upgrade to premium
  async upgradeToPremium(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updates = {
      isPremium: true,
      subscriptionStatus: 'premium' as const,
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    return this.updateProfile(updates);
  }

  // Upgrade to professional
  async upgradeToProfessional(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updates = {
      isPremium: true,
      isProfessional: true,
      subscriptionStatus: 'professional' as const,
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    return this.updateProfile(updates);
  }

  // Email verification
  async verifyEmail(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    return this.updateProfile({ emailVerified: true });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
