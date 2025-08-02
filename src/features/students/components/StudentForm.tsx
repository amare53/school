import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Hash,
  Users,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import {
  useApiPlatformCollection,
  useAuth,
  useUI,
} from "../../../shared/hooks";
import {
  studentSchema,
  type StudentFormData,
} from "../../../shared/validations";
import { generateStudentNumber } from "../../../shared/utils";
import type { Student } from "../../../shared/types";
import {
  academicYearsApi,
  classesApi,
  enrollmentApi,
  studentsApi,
} from "@/shared/services/api";
import { ZodError } from "zod";

interface StudentFormProps {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const genderOptions = [
  { value: "male", label: "Masculin" },
  { value: "female", label: "Féminin" },
];

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSuccess,
  onCancel,
}) => {
  const { currentSchool, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: undefined,
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    classId: "",
    studentNumber: "",
    school: user?.schoolId,
  });
  const [errors, setErrors] = useState<Partial<StudentFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { data: academicYears, loading } = useApiPlatformCollection(
    (params) => academicYearsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 12,
      current: true,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );
  const { data: availableClasses, loading: load } = useApiPlatformCollection(
    (params) => classesApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 2000,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  const { showNotification } = useUI();

  // TODO: Remplacer par des appels API réels
  // const currentAcademicYear = null;
  const currentAcademicYear = academicYears?.find((a) => a?.current === "true");
  const studentNumber = generateStudentNumber(
    currentSchool?.name.substring(0, 1).toUpperCase() || "SCH",
    new Date().getFullYear()
  );

  // Initialiser le formulaire avec les données de l'élève si en mode édition
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender,
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        parentEmail: student.parentEmail || "",
        address: student.address || "",
        classId: "",
        studentNumber: student.studentNumber,
        school: user?.schoolId,
      });
    }
  }, [student]);

  const handleChange =
    (field: keyof StudentFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Effacer l'erreur quand l'utilisateur tape
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange =
    (field: keyof StudentFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    try {
      studentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<StudentFormData> = {};
      if (error instanceof ZodError) {
        error.issues?.forEach((err: any) => {
          const field = err.path[0] as keyof StudentFormData;
          fieldErrors[field] = err.message;
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
      const data = { ...formData };
      data.school = `/api/schools/${data.school}`;
      for (const key in data) {
        if (data[key] === undefined) {
          delete data[key];
        } else if (data[key].length === 0) {
          delete data[key];
        }
      }

      if (student) {
        await studentsApi.update(student.id, data);
      } else {
        data.studentNumber = studentNumber;
        const response = await studentsApi.create(data);
        await enrollmentApi.create({
          school: data.school,
          student: response["@id"],
          schoolClass: `/api/school_classes/${data.classId}`,
          academicYear: currentAcademicYear["@id"],
        });
      }

      const action = student ? "modifié" : "créé";
      showNotification(`Élève ${action} avec succès`, "success", "", 5000);

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de la sauvegarde",
        "error",
        "",
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const classOptions: any[] = availableClasses.map((a) => ({
    value: a.id,
    label: `${a.level} ${a?.section?.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vérifier si une année courante existe */}
      {!currentAcademicYear && !student && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">
                Aucune année académique courante
              </p>
              <p>Il n'y a pas d'année académique définie comme "courante".</p>
            </div>
          </div>
        </div>
      )}

      {/* Informations personnelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations Personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Nom *"
            placeholder="Nom de famille"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
            disabled={isLoading}
          />
          <Input
            label="Postnom"
            placeholder="Postnom de l'élève"
            value={formData.middleName}
            onChange={handleChange("middleName")}
            error={errors.middleName}
            disabled={isLoading}
          />
          <Input
            label="Prénom *"
            placeholder="Prénom de l'élève"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date de naissance"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange("dateOfBirth")}
            error={errors.dateOfBirth}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />

          <Select
            label="Genre"
            options={genderOptions}
            value={formData.gender || ""}
            onChange={handleSelectChange("gender")}
            error={errors.gender}
            placeholder="Sélectionner le genre"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Informations du parent/tuteur */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Informations du Parent/Tuteur
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom du parent/tuteur"
            placeholder="Nom complet du parent ou tuteur"
            value={formData.parentName}
            onChange={handleChange("parentName")}
            error={errors.parentName}
            leftIcon={<User className="h-4 w-4" />}
            disabled={isLoading}
          />
          <Input
            label="Téléphone du parent"
            placeholder="+243 XX XXX XXXX"
            value={formData.parentPhone}
            onChange={handleChange("parentPhone")}
            error={errors.parentPhone}
            leftIcon={<Phone className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Inscription en classe (seulement pour les nouveaux élèves) */}
      {currentAcademicYear && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Inscription en Classe
          </h3>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Année académique courante : {currentAcademicYear.name}
                </p>
                <p>Vous pouvez directement inscrire l'élève dans une classe.</p>
              </div>
            </div>
          </div>

          {availableClasses.length > 0 ? (
            <Select
              label="Classe"
              options={classOptions}
              value={formData.classId || ""}
              onChange={handleSelectChange("classId")}
              error={errors.classId}
              placeholder="Sélectionner une classe"
              disabled={isLoading}
              helperText="L'élève sera automatiquement inscrit dans la classe sélectionnée"
            />
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Aucune classe disponible</p>
                  <p>
                    Il n'y a pas de classes créées pour l'année courante. Vous
                    devez inscrire l'élève dans une classe.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Aperçu du numéro d'élève pour les nouveaux élèves */}
      {!student && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Numéro d'élève :</h4>
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-mono">{studentNumber}</span>
            <span className="text-blue-600 text-sm">
              (généré automatiquement)
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={
            isLoading ||
            currentAcademicYear === null ||
            availableClasses.length === 0
          }
        >
          {student ? "Modifier" : "Créer"} l'Élève
        </Button>
      </div>
    </form>
  );
};

export { StudentForm };
