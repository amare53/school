import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Layers,
  Users,
  BookOpen,
  Settings,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { AcademicYearsList } from "../components/AcademicYearsList";
import { LevelsList } from "../components/LevelsList";
import { SectionsList } from "../components/SectionsList";
import { ClassesList } from "../components/ClassesList";
import { useAuth } from "@/shared/stores";

type TabType = "years" | "levels" | "sections" | "classes";

const AcademicStructurePage: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("years");

  // TODO: Remplacer par des appels API réels
  const academicYears: any[] = [];
  const levels: any[] = [];
  const sections: any[] = [];
  const classes: any[] = [];

  // Vérifier les permissions
  if (user?.role !== "school_manager") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Seuls les gestionnaires d'école peuvent gérer la structure académique.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: "years" as TabType,
      name: "Années Académiques",
      icon: Calendar,
      description: "Gérer les années scolaires",
      count: academicYears.length,
    },
    {
      id: "levels" as TabType,
      name: "Niveaux",
      icon: Layers,
      description: "Définir les niveaux scolaires",
      count: levels.length,
    },
    {
      id: "sections" as TabType,
      name: "Sections",
      icon: BookOpen,
      description: "Organiser les sections par niveau",
      count: sections.length,
    },
    {
      id: "classes" as TabType,
      name: "Classes",
      icon: Users,
      description: "Créer et gérer les classes",
      count: classes.length,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "years":
        return <AcademicYearsList />;
      case "levels":
        return <LevelsList />;
      case "sections":
        return <SectionsList />;
      case "classes":
        return <ClassesList />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Structure Académique
          </h1>
          <p className="text-gray-600">
            Gérez la structure de {currentSchool?.name || "votre école"}
          </p>
        </div>
        <Button leftIcon={<Settings className="h-4 w-4" />} variant="outline">
          Configuration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === tab.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeTab === tab.id ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          activeTab === tab.id
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {tab.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tab.count}
                      </p>
                    </div>
                  </div>
                  {activeTab === tab.id && (
                    <Badge variant="info" size="sm">
                      Actif
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{tab.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
                <Badge
                  variant={activeTab === tab.id ? "info" : "default"}
                  size="sm"
                  className="ml-2"
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
};

export { AcademicStructurePage };
