import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { useApiPlatformCollection } from "../../../shared/hooks";
import { StudentForm } from "../components/StudentForm";
import { studentsApi } from "@/shared/services/api";

const StudentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, loading } = useApiPlatformCollection(
    (id) => studentsApi.getItem(id),
    id,
    {
      cacheKey: "sections_list",
      immediate: true,
      one: true,
    }
  );

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Élève non trouvé
        </h2>
        <p className="text-gray-600 mb-4">
          L'élève demandé n'existe pas ou vous n'avez pas les permissions pour
          le modifier.
        </p>
        <Button onClick={() => navigate("/students")}>Retour à la liste</Button>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate(`/students/${student.id}`);
  };

  const handleCancel = () => {
    navigate(`/students/${student.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600">
            Numéro d'élève : {student.studentNumber}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/students/${student.id}`)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Retour
        </Button>
      </div>

      {/* Formulaire */}
      <div className="max-w-4xl">
        <StudentForm
          student={student}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export { StudentEditPage };
