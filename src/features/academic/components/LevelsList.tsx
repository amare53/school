import React, { useState } from 'react';
import { Plus, Layers, Edit, Archive, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { Modal } from '../../../shared/components/ui/Modal';
import { useAuth, useModal } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { LevelForm } from './LevelForm';
import type { Level } from '../../../shared/types';

const LevelsList: React.FC = () => {
  const { currentSchool } = useAuth();
  const { getLevelsBySchool } = useFakeDataStore();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les niveaux pour l'école courante
  const schoolId = currentSchool?.id || '';
  const levels = getLevelsBySchool(schoolId);

  const handleCreateLevel = () => {
    setSelectedLevel(null);
    openForm();
  };

  const handleEditLevel = (level: Level) => {
    setSelectedLevel(level);
    openForm();
  };

  const handleMoveUp = (level: Level) => {
    // Logique pour déplacer vers le haut
    console.log('Move up:', level.name);
  };

  const handleMoveDown = (level: Level) => {
    // Logique pour déplacer vers le bas
    console.log('Move down:', level.name);
  };

  const columns: Column<Level>[] = [
    {
      key: 'orderIndex',
      title: 'Ordre',
      width: '80px',
      render: (orderIndex) => (
        <Badge variant="default" size="sm">
          {orderIndex}
        </Badge>
      ),
    },
    {
      key: 'name',
      title: 'Niveau',
      sortable: true,
      render: (_, level) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Layers className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{level.name}</div>
            <div className="text-sm text-gray-500">Code: {level.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      title: 'Code',
      render: (code) => (
        <Badge variant="info" size="sm">
          {code}
        </Badge>
      ),
    },
    {
      key: 'sections',
      title: 'Sections',
      render: () => (
        <div className="text-sm text-gray-600">
          2 sections
        </div>
      ),
    },
    {
      key: 'students',
      title: 'Élèves',
      render: () => (
        <div className="text-sm text-gray-600">
          45 élèves
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, level, index) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMoveUp(level)}
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMoveDown(level)}
            disabled={index === levels.length - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditLevel(level)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Niveaux Scolaires</h2>
          <p className="text-gray-600">Définissez la hiérarchie des niveaux de votre école</p>
        </div>
        <Button onClick={handleCreateLevel} leftIcon={<Plus className="h-4 w-4" />}>
          Nouveau Niveau
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Organisation hiérarchique</p>
              <p>Les niveaux sont organisés par ordre croissant. Utilisez les flèches pour réorganiser l'ordre des niveaux selon votre système éducatif.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Niveaux ({levels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={levels}
            columns={columns}
            loading={false}
            emptyMessage="Aucun niveau trouvé"
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedLevel ? 'Modifier le Niveau' : 'Nouveau Niveau'}
        size="md"
      >
        <LevelForm
          level={selectedLevel}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { LevelsList };