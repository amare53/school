import React from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "../components/StudentForm";

const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/students`);
  };

  const handleCancel = () => {
    navigate(`/students`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Élève</h1>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-4xl">
        <StudentForm
          student={null}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export { StudentCreatePage };
