import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Select } from "../../../shared/components/ui/Select";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { useApiPlatformCollection, useAuth } from "../../../shared/hooks";
import { useFakeDataStore } from "../../../shared/stores/fakeData";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { STUDENT_STATUS_LABELS } from "../../../shared/constants";
import { reportsApi, sectionsApi } from "@/shared/services/api";

const StudentReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { getSectionsBySchool } = useFakeDataStore();

  const [groupBy, setGroupBy] = useState("status");
  const [period, setPeriod] = useState("");

  const {
    data: reports,
    loading,
    updateParams,
    execute,
  } = useApiPlatformCollection(
    (params) => reportsApi.getStudentsReport(params),
    {},
    {
      cacheKey: "sections_list",
      immediate: true,
      one: true,
    }
  );

  const { data: sections } = useApiPlatformCollection(
    (params) => sectionsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 200,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  // Statistiques générales
  const totalStudents = reports?.total || 0;
  const activeStudents = reports?.active || 0;
  const maleStudents = reports?.male || 0;
  const femaleStudents = reports?.female || 0;
  const newStudents = reports?.newStudents || 0;

  const groupByOptions = [
    { value: "status", label: "Par statut" },
    { value: "section", label: "Par section" },
  ];

  const periodOptions = sections.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <Select
                label="Grouper par"
                options={groupByOptions}
                value={groupBy}
                onChange={(e) => {
                  setPeriod(null);
                  setGroupBy(e);
                  if (e === "status") {
                    execute({
                      page: 1,
                      itemsPerPage: 200,
                      order: { createdAt: "desc" },
                    });
                  }
                }}
              />
            </div>
            {groupBy === "section" && (
              <div className="w-48">
                <Select
                  label="Section"
                  options={periodOptions}
                  value={period}
                  onChange={(section) => {
                    setPeriod(section);
                    updateParams({
                      section,
                    });
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Élèves
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalStudents}
                </p>
                <p className="text-xs text-gray-500 mt-1">Tous statuts</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Élèves Actifs
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeStudents}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {totalStudents > 0
                    ? Math.round((activeStudents / totalStudents) * 100)
                    : 0}
                  % du total
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Nouveaux cette Année
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {newStudents}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {totalStudents > 0
                    ? Math.round((newStudents / totalStudents) * 100)
                    : 0}
                  % du total
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ratio Filles/Garçons
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {maleStudents > 0
                    ? Math.round((femaleStudents / maleStudents) * 100) / 100
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {femaleStudents}F / {maleStudents}M
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { StudentReports };
