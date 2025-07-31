import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth, useUI } from "../../../shared/hooks";
import { authApi } from "../../../shared/services/api";
import { loginSchema, type LoginFormData } from "../../../shared/validations";
import * as z from "zod";
import { USER_ROLES } from "@/shared/constants";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "admin@csoasis.com",
    password: "password123",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setToken, setCurrentSchool } = useAuth();
  const { login } = useAuth();
  const { showNotification } = useUI();
  const navigate = useNavigate();

  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Effacer l'erreur quand l'utilisateur tape
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginFormData> = {};
        error.issues?.forEach((err) => {
          const field = err.path[0] as keyof LoginFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }

      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);

      // Mettre à jour le store avec login
      login(response.user, response.token);

      // Si l'utilisateur a une école associée, la définir comme école courante
      if (response.user.schoolId && response.user.school) {
        // Ici on pourrait faire un appel API pour récupérer les détails de l'école
        // Pour l'instant, on simule
        setCurrentSchool(response.user.school);
      } else if (
        response.user.role === USER_ROLES.SCHOOL_MANAGER &&
        response.user.assignedSchools?.length === 1
      ) {
        // Si school_manager avec une seule école, la définir comme courante
        // Dans un vrai système, on récupérerait les détails de l'école
        // setCurrentSchool(schoolDetails);
      }

      showNotification("Connexion réussie", "success", "Bienvenue !", 5000);
      // navigate("/students", { replace: true });
    } catch (error: any) {
      showNotification(
        error.message || "Erreur de connexion",
        "error",
        "Échec de la connexion",
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <Input
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={isLoading}
        />
      </div>

      {/* Mot de passe */}
      <div>
        <Input
          type={showPassword ? "text" : "password"}
          label="Mot de passe"
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={handleChange("password")}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          disabled={isLoading}
        />
      </div>

      {/* Options */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
        </label>

        {/* <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-500"
          disabled={isLoading}
        >
          Mot de passe oublié ?
        </button> */}
      </div>

      {/* Bouton de connexion */}
      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        Se connecter
      </Button>

      {/* Message d'aide */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Admin École:</strong> admin@csoasis.com / password123
              </p>
              {/* <p>
                <strong>Admin École :</strong> admin.ecole@csoasis.com /
                password123
              </p> */}
              <p>
                <strong>Caissier :</strong> cashier@csoasis.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export { LoginForm };
