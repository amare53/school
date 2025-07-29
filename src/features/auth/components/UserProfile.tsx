import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { useAuth, useUI } from '../../../shared/hooks';
import { USER_ROLE_LABELS } from '../../../shared/constants';
import { formatDate } from '../../../shared/utils';
import { ChangePasswordForm } from './ChangePasswordForm';

const UserProfile: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const { showNotification } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      // Ici on ferait l'appel API pour mettre à jour le profil
      // await usersApi.update(user.id, formData);
      
      showNotification('Profil mis à jour avec succès', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et paramètres de compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit2 className="h-4 w-4" />}
                  >
                    Modifier
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">{USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS]}</p>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                      Changer la photo
                    </Button>
                  )}
                </div>
              </div>

              {/* Formulaire */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
                <Input
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  value={user.email}
                  disabled
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations du compte */}
        <div className="space-y-6">
          {/* Statut du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Statut du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge variant="success">Actif</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rôle</span>
                <Badge variant="info">
                  {USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Membre depuis</span>
                <span className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dernière connexion</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(user.lastLogin, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* École associée */}
          {currentSchool && (
            <Card>
              <CardHeader>
                <CardTitle>École</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{currentSchool.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan</span>
                    <Badge variant="info" className="capitalize">
                      {currentSchool.subscriptionPlan}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowChangePassword(true)}
              >
                Changer le mot de passe
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                Télécharger mes données
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Changer le mot de passe"
        size="md"
      >
        <ChangePasswordForm onSuccess={() => setShowChangePassword(false)} />
      </Modal>
    </div>
  );
};

export { UserProfile };