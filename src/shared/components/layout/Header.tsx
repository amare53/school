import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  DollarSign,
  BarChart3,
  School,
  Calendar,
  BookOpen,
  Receipt,
  TrendingUp,
  Archive,
  MoreHorizontal,
  UserCog,
  Calculator,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useAuth, useUI } from "../../hooks";
import { USER_ROLE_LABELS, USER_ROLES } from "../../constants";
import { cn } from "../../utils";

interface HeaderProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

// Actions principales (toujours visibles si autorisées)
const primaryNavigation: NavItem[] = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
    roles: [
      USER_ROLES.PLATFORM_ADMIN,
      USER_ROLES.SCHOOL_MANAGER,
      USER_ROLES.ACCOUNTANT,
    ],
  },
  {
    name: "Écoles",
    href: "/schools",
    icon: School,
    roles: [USER_ROLES.PLATFORM_ADMIN],
  },
  {
    name: "Élèves",
    href: "/students",
    icon: GraduationCap,
    roles: [USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER],
  },
  {
    name: "Configuration Frais",
    href: "/billing",
    icon: FileText,
    roles: [USER_ROLES.SCHOOL_MANAGER],
  },
  {
    name: "Caisse",
    href: "/cash",
    icon: Calculator,
    roles: [USER_ROLES.CASHIER],
  },
  {
    name: "Rapports et Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: [
      USER_ROLES.SCHOOL_MANAGER,
      USER_ROLES.CASHIER,
      USER_ROLES.ACCOUNTANT,
    ],
  },
  {
    name: "Rapports de Caisse",
    href: "/cashier/reports",
    icon: BarChart3,
    roles: [USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER],
  },
  {
    name: "Dépenses",
    href: "/expenses",
    icon: DollarSign,
    roles: [],
  },
  {
    name: "School Managers",
    href: "/school-managers",
    icon: UserCog,
    roles: [USER_ROLES.PLATFORM_ADMIN],
  },
  {
    name: "Utilisateurs",
    href: "/users",
    icon: Users,
    roles: [USER_ROLES.SCHOOL_MANAGER],
  },
];

// Actions secondaires groupées dans le dropdown "Plus"
const secondaryNavigation: NavGroup[] = [
  {
    name: "Structure Académique",
    items: [
      {
        name: "Sections",
        href: "/sections",
        icon: BookOpen,
        roles: [USER_ROLES.SCHOOL_MANAGER],
      },
      {
        name: "Classes",
        href: "/classes",
        icon: Users,
        roles: [USER_ROLES.SCHOOL_MANAGER],
      },
      {
        name: "Années Académiques",
        href: "/academic-years",
        icon: Calendar,
        roles: [USER_ROLES.SCHOOL_MANAGER],
      },
    ],
  },
];

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, currentSchool, logout, canAccess } = useAuth();
  const { unreadNotificationsCount } = useUI();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navigate = useNavigate();

  // Filtrer les actions principales selon les rôles
  const filteredPrimaryNavigation = primaryNavigation.filter(
    (item) => user && canAccess(item.roles)
  );

  // Filtrer les groupes secondaires selon les rôles
  const filteredSecondaryNavigation = secondaryNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => user && canAccess(item.roles)),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = () => {
    // AuthService.logout()
    //   .then(() => {
    //     logout();
    //     window.location.href = "/login";
    //   })
    //   .catch(() => {
    //     // Même si l'API échoue, on déconnecte quand même l'utilisateur
    //     logout();
    //     window.location.href = "/login";
    //   });
    logout();
    navigate("/login", {
      replace: true,
    });
    setUserMenuOpen(false);
  };

  return (
    <header
      className={cn("bg-white border-b border-gray-200 shadow-sm", className)}
    >
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo and school info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {currentSchool?.name || "SchoolManager Pro"}
              </h1>
              {currentSchool && (
                <p className="text-xs text-gray-500">
                  Gestion scolaire intégrée
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotificationsCount > 9
                    ? "9+"
                    : unreadNotificationsCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {USER_ROLE_LABELS[user?.role]}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <NavLink
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 no-underline"
                >
                  <UserCog className="h-4 w-4 mr-3" />
                  Mon Profil
                </NavLink>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
        <nav className="flex items-center space-x-1">
          {/* Actions principales (max 7) */}
          {filteredPrimaryNavigation.slice(0, 7).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                )
              }
            >
              <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
              {item.badge && (
                <Badge variant="info" size="sm" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}

          {/* Menu "Plus" pour les actions supplémentaires */}
          {(filteredPrimaryNavigation.length > 6 ||
            filteredSecondaryNavigation.length > 0) && (
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  moreMenuOpen
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                )}
              >
                <MoreHorizontal className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Plus</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>

              {/* Dropdown "Plus" */}
              {moreMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Actions principales restantes */}
                  {filteredPrimaryNavigation.slice(7).map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50",
                          isActive
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-700"
                        )
                      }
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="info" size="sm" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  ))}

                  {/* Séparateur si il y a des actions principales restantes */}
                  {filteredPrimaryNavigation.length > 6 &&
                    filteredSecondaryNavigation.length > 0 && (
                      <hr className="my-2" />
                    )}

                  {/* Groupes d'actions secondaires */}
                  {filteredSecondaryNavigation.map((group, groupIndex) => (
                    <div key={group.name}>
                      {groupIndex > 0 && <hr className="my-2" />}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {group.name}
                        </p>
                      </div>
                      {group.items.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center w-full px-6 py-2 text-sm hover:bg-gray-50",
                              isActive
                                ? "text-blue-700 bg-blue-50"
                                : "text-gray-600"
                            )
                          }
                        >
                          <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge variant="info" size="sm" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export { Header };
