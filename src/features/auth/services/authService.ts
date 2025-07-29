import { authApi } from '../../../shared/services/api';
import { useAppStore } from '../../../shared/stores';
import type { User } from '../../../shared/types';

export class AuthService {
  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    const { authToken, user } = useAppStore.getState();
    return !!(authToken && user);
  }

  // Récupérer l'utilisateur courant depuis le localStorage
  static getCurrentUser(): User | null {
    const { user } = useAppStore.getState();
    return user;
  }

  // Récupérer le token depuis le localStorage
  static getToken(): string | null {
    const { authToken } = useAppStore.getState();
    return authToken;
  }

  // Connexion
  static async login(email: string, password: string) {
    try {
      const response = await authApi.login(email, password);
      
      // Stocker les données dans le store
      const { login } = useAppStore.getState();
      login(response.data.user, response.data.token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  static async logout() {
    try {
      // Appeler l'API de déconnexion si nécessaire
      await authApi.logout();
    } catch (error) {
      // Continuer même si l'API échoue
      console.warn('Logout API call failed:', error);
    } finally {
      // Nettoyer le store
      const { logout } = useAppStore.getState();
      logout();
    }
  }

  // Rafraîchir le token
  static async refreshToken() {
    try {
      const response = await authApi.refreshToken();
      const { setAuthToken } = useAppStore.getState();
      setAuthToken(response.data.token);
      return response.data.token;
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      this.logout();
      throw error;
    }
  }

  // Changer le mot de passe
  static async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier les permissions
  static hasPermission(permission: string, userRole?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const role = userRole || user.role;
    
    // Admin plateforme a tous les droits
    if (role === 'platform_admin') return true;
    
    // Logique de permissions basée sur les rôles
    const permissions: Record<string, string[]> = {
      platform_admin: ['*'], // Toutes les permissions
      school_manager: [
        'school:manage',
        'users:manage',
        'students:manage',
        'billing:manage',
        'reports:view',
        'settings:manage'
      ],
      cashier: [
        'students:create',
        'students:read',
        'students:update',
        'invoices:manage',
        'payments:manage',
        'expenses:manage'
      ],
      accountant: [
        'accounting:read',
        'reports:accounting',
        'payments:read',
        'invoices:read'
      ],
      student: [
        'profile:read',
        'invoices:read:own',
        'payments:read:own'
      ]
    };

    const userPermissions = permissions[role] || [];
    
    // Si l'utilisateur a toutes les permissions
    if (userPermissions.includes('*')) return true;
    
    // Vérifier la permission spécifique
    return userPermissions.includes(permission);
  }

  // Vérifier l'accès par rôle
  static canAccess(allowedRoles: string[], userRole?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const role = userRole || user.role;
    return allowedRoles.includes(role);
  }

  // Initialiser l'authentification au démarrage de l'app
  static async initializeAuth() {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && user) {
      try {
        // Vérifier que le token est toujours valide
        const response = await authApi.getMe();
        
        // Mettre à jour les données utilisateur si nécessaire
        if (response.data) {
          storage.set('current_user', response.data);
          return response.data;
        }
      } catch (error) {
        // Token invalide, nettoyer le localStorage
        this.logout();
        throw error;
      }
    }

    return null;
  }

  // Simuler des utilisateurs pour la démonstration
  static getDemoUsers() {
    return [
      {
        id: '1',
        email: 'admin@school.com',
        password: 'password123',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'platform_admin',
        schoolId: null,
      },
      {
        id: '2',
        email: 'admin.ecole1@school.com',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Martin',
        role: 'school_manager',
        schoolId: 'school-1',
      },
      {
        id: '3',
        email: 'cashier@school.com',
        password: 'password123',
        firstName: 'Pierre',
        lastName: 'Durand',
        role: 'cashier',
        schoolId: 'school-1',
      },
      {
        id: '4',
        email: 'accountant@school.com',
        password: 'password123',
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: 'accountant',
        schoolId: 'school-1',
      },
    ];
  }
}