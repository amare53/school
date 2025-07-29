import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, Mail, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Select } from '../../../shared/components/ui/Select';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';

const ExportCenter: React.FC = () => {
  const { currentSchool } = useAuth();
  const { showNotification } = useUI();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [period, setPeriod] = useState('current_month');
  const [isExporting, setIsExporting] = useState(false);

  // Types de rapports disponibles
  const availableReports = [
    {
      id: 'financial_summary',
      name: 'Résumé Financier',
      description: 'Vue d\'ensemble des revenus et dépenses',
      category: 'Financier',
      size: '2-3 pages',
    },
    {
      id: 'student_list',
      name: 'Liste des Élèves',
      description: 'Liste complète avec informations de contact',
      category: 'Élèves',
      size: '5-10 pages',
    },
    {
      id: 'invoices_report',
      name: 'Rapport des Factures',
      description: 'Toutes les factures avec statuts',
      category: 'Facturation',
      size: '3-8 pages',
    },
    {
      id: 'payments_report',
      name: 'Rapport des Paiements',
      description: 'Historique complet des paiements',
      category: 'Paiements',
      size: '2-5 pages',
    },
    {
      id: 'expenses_report',
      name: 'Rapport des Dépenses',
      description: 'Dépenses par catégorie avec justificatifs',
      category: 'Dépenses',
      size: '2-4 pages',
    },
    {
      id: 'balance_sheet',
      name: 'Bilan Comptable',
      description: 'Actif et passif de l\'école',
      category: 'Comptabilité',
      size: '1-2 pages',
    },
    {
      id: 'income_statement',
      name: 'Compte de Résultat',
      description: 'Produits et charges de l\'exercice',
      category: 'Comptabilité',
      size: '1-2 pages',
    },
    {
      id: 'trial_balance',
      name: 'Balance Générale',
      description: 'Tous les comptes avec soldes',
      category: 'Comptabilité',
      size: '2-3 pages',
    },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
  ];

  const periodOptions = [
    { value: 'current_month', label: 'Mois en cours' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'current_quarter', label: 'Trimestre en cours' },
    { value: 'current_year', label: 'Année en cours' },
    { value: 'last_year', label: 'Année dernière' },
    { value: 'custom', label: 'Période personnalisée' },
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReports(
      selectedReports.length === availableReports.length 
        ? [] 
        : availableReports.map(r => r.id)
    );
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      showNotification('Veuillez sélectionner au moins un rapport', 'warning');
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulation de l'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification(
        `${selectedReports.length} rapport(s) exporté(s) avec succès`,
        'success'
      );
      
      // Simulation du téléchargement
      const fileName = `rapports_${currentSchool?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      console.log('Téléchargement simulé:', fileName);
      
    } catch (error) {
      showNotification('Erreur lors de l\'export', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleScheduleReport = () => {
    showNotification('Fonctionnalité de planification à venir', 'info');
  };

  const handleEmailReport = () => {
    showNotification('Envoi par email à venir', 'info');
  };

  // Grouper les rapports par catégorie
  const reportsByCategory = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof availableReports>);

  return (
    <div className="space-y-6">
      {/* Configuration de l'export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Configuration de l'Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Format d'export"
              options={formatOptions}
              value={exportFormat}
              onChange={setExportFormat}
            />
            
            <Select
              label="Période"
              options={periodOptions}
              value={period}
              onChange={setPeriod}
            />
            
            <div className="flex items-end">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="w-full"
              >
                {selectedReports.length === availableReports.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
            </div>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Date de début"
                type="date"
                leftIcon={<Calendar className="h-4 w-4" />}
              />
              <Input
                label="Date de fin"
                type="date"
                leftIcon={<Calendar className="h-4 w-4" />}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sélection des rapports */}
      <div className="space-y-6">
        {Object.entries(reportsByCategory).map(([category, reports]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category}</span>
                <Badge variant="info" size="sm">
                  {reports.filter(r => selectedReports.includes(r.id)).length}/{reports.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReports.includes(report.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleReportToggle(report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={() => handleReportToggle(report.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default" size="sm">{report.size}</Badge>
                          <span className="text-xs text-gray-500">• {report.category}</span>
                        </div>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions d'export */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedReports.length}</span> rapport(s) sélectionné(s)
              </div>
              {selectedReports.length > 0 && (
                <Badge variant="info">
                  Format: {formatOptions.find(f => f.value === exportFormat)?.label}
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleEmailReport}
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={selectedReports.length === 0}
              >
                Envoyer par Email
              </Button>
              
              <Button
                variant="outline"
                onClick={handleScheduleReport}
                leftIcon={<Clock className="h-4 w-4" />}
                disabled={selectedReports.length === 0}
              >
                Planifier
              </Button>
              
              <Button
                onClick={handleExport}
                loading={isExporting}
                disabled={selectedReports.length === 0 || isExporting}
                leftIcon={<Download className="h-4 w-4" />}
              >
                {isExporting ? 'Export en cours...' : 'Exporter'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des exports */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: '2024-01-15',
                reports: ['Résumé Financier', 'Liste des Élèves'],
                format: 'PDF',
                size: '2.3 MB',
                status: 'Terminé',
              },
              {
                date: '2024-01-10',
                reports: ['Bilan Comptable'],
                format: 'Excel',
                size: '1.1 MB',
                status: 'Terminé',
              },
              {
                date: '2024-01-05',
                reports: ['Rapport des Paiements', 'Rapport des Dépenses'],
                format: 'PDF',
                size: '3.7 MB',
                status: 'Terminé',
              },
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {export_.reports.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(export_.date)} • {export_.format} • {export_.size}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success" size="sm">{export_.status}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ExportCenter };