import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  User,
  DollarSign,
  TrendingUp,
  Clock,
  Calculator,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { useAuth, useUI } from "../../../shared/hooks";
import { cashReportService } from "../services/cashService";
import { formatCurrency, formatDate } from "../../../shared/utils";
import type {
  CashRegisterReport,
  DailyCashReport,
} from "../../../shared/types/cash";

const CashReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { showNotification } = useUI();

  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCashier, setSelectedCashier] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      let data;

      if (reportType === "daily") {
        data = await cashReportService.getDailyReport(selectedDate);
      } else {
        data = await cashReportService.getPeriodReport({
          dateFrom,
          dateTo,
          cashierId: selectedCashier || undefined,
        });
      }

      setReportData(data);
    } catch (error: any) {
      showNotification("Erreur lors du chargement du rapport", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: "pdf" | "excel") => {
    if (!reportData) return;

    try {
      if (reportType === "daily" && reportData.sessions?.length > 0) {
        const blob = await cashReportService.exportSessionReport(
          reportData.sessions[0].sessionId,
          format
        );

        // Télécharger le fichier
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rapport_caisse_${selectedDate}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showNotification("Rapport exporté avec succès", "success");
      }
    } catch (error: any) {
      showNotification("Erreur lors de l'export", "error");
    }
  };

  const reportTypeOptions = [
    { value: "daily", label: "Rapport Journalier" },
    { value: "period", label: "Rapport par Période" },
  ];

  // TODO: Charger la liste des caissiers
  const cashierOptions = [
    { value: "", label: "Tous les caissiers" },
    // Ajouter les caissiers dynamiquement
  ];

  const sessionColumns: Column<CashRegisterReport>[] = [
    {
      key: "sessionNumber",
      title: "Session",
      render: (_, session) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calculator className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {session.sessionNumber}
            </div>
            <div className="text-sm text-gray-500">{session.cashierName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "openedAt",
      title: "Ouverture",
      render: (date) => formatDate(date, "HH:mm"),
    },
    {
      key: "closedAt",
      title: "Fermeture",
      render: (date) =>
        date ? (
          formatDate(date, "HH:mm")
        ) : (
          <Badge variant="warning" size="sm">
            En cours
          </Badge>
        ),
    },
    {
      key: "total_collected",
      title: "Encaissé",
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "paymentsCount",
      title: "Nb Paiements",
      render: (count) => (
        <Badge variant="info" size="sm">
          {count}
        </Badge>
      ),
    },
    {
      key: "cashDifference",
      title: "Écart",
      render: (difference) => {
        if (difference === undefined || difference === null) return "-";

        return (
          <div
            className={`font-medium ${
              Math.abs(difference) < 0.01
                ? "text-green-600"
                : difference > 0
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            {difference > 0 ? "+" : ""}
            {formatCurrency(difference, currentSchool?.currency)}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Rapports de Caisse
          </h2>
          <p className="text-gray-600">
            Consultez les rapports d'activité de caisse
          </p>
        </div>
        {reportData && (
          <div className="flex space-x-2">
            {/* <Button
              variant="outline"
              onClick={() => exportReport("pdf")}
              leftIcon={<Download className="h-4 w-4" />}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport("excel")}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Excel
            </Button> */}
          </div>
        )}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Type de rapport"
              options={reportTypeOptions}
              value={reportType}
              onChange={(type) => {
                setReportData(null);
                setReportType(type);
              }}
            />

            {reportType === "daily" ? (
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                leftIcon={<Calendar className="h-4 w-4" />}
              />
            ) : (
              <>
                <Input
                  label="Date de début"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
                <Input
                  label="Date de fin"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
              </>
            )}

            <div className="flex items-end">
              <Button
                onClick={loadReport}
                loading={isLoading}
                leftIcon={<BarChart3 className="h-4 w-4" />}
                className="w-full"
              >
                Générer le Rapport
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats du rapport */}
      {reportData && (
        <>
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Sessions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.sessionsCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Encaissé
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        reportData.total_collected,
                        currentSchool?.currency
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Mouvements Net
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        reportData.total_cash_movements_in -
                          reportData.total_cash_movements_out >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {reportData.total_cash_movements_in -
                        reportData.total_cash_movements_out >=
                      0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        reportData.total_cash_movements_in -
                          reportData.total_cash_movements_out,
                        currentSchool?.currency
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Écart Total
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        Math.abs(reportData.sessions_with_differences) < 0.01
                          ? "text-green-600"
                          : reportData.sessions_with_differences > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {reportData.sessions_with_differences > 0 ? "+" : ""}
                      {formatCurrency(
                        reportData.sessions_with_differences,
                        currentSchool?.currency
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des sessions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === "daily"
                  ? "Sessions du Jour"
                  : "Sessions de la Période"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table
                data={reportData.sessions}
                columns={sessionColumns}
                loading={isLoading}
                emptyMessage="Aucune session trouvée"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export { CashReports };
