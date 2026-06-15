"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Download, Upload, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/app/page";

interface GradesInputProps {
  student: Student;
  onSave: (student: Student) => void;
}

interface Grade {
  subject: string;
  grades: {
    [gradeLevel: string]: {
      semester1: number;
      semester2: number;
      quarter1?: number;
      quarter2?: number;
      quarter3?: number;
      quarter4?: number;
      yearAvg: number;
      total: number;
    };
  };
}

interface ConductData {
  [gradeLevel: string]: {
    semester1: string;
    semester2: string;
    quarter1?: string;
    quarter2?: string;
    quarter3?: string;
    quarter4?: string;
    yearAvg: string;
  };
}

export function GradesInput({ student, onSave }: GradesInputProps) {
  console.log("[v0] GradesInput component loaded for student:", student?.name);
  console.log("[v0] Student grades data:", student?.grades);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editableTotals, setEditableTotals] = useState<{ [key: string]: any }>(
    {}
  );
  const [conduct, setConduct] = useState<ConductData>({});
  const [customSubjects, setCustomSubjects] = useState<string[]>(student.customSubjects || []);
  const [deletedSubjects, setDeletedSubjects] = useState<{ [gradeLevel: string]: string[] }>(student.deletedSubjects || {});
  const [newSubjectName, setNewSubjectName] = useState("");

  const getGradeLevels = (template: string): string[] => {
    switch (template) {
      case "G9-G12":
        return ["G9", "G10", "G11", "G12"];
      case "G10-G12":
        return ["G10", "G11", "G12"];
      case "G11-G12":
        return ["G11", "G12"];
      case "G12":
        return ["G12"];
      default:
        return ["G12"];
    }
  };

  const initializeGrades = (): Grade[] => {
    console.log("[v0] Initializing grades for template:", student?.template);

    if (!student || !student.template) {
      console.log("[v0] No student or template found, returning empty grades");
      return [];
    }

    const gradeLevels = getGradeLevels(student.template);
    console.log("[v0] Grade levels for template:", gradeLevels);

    const initialConduct: ConductData = {};
    const isQuarter = student.termSystem === "quarter";
    gradeLevels.forEach((level) => {
      if (isQuarter) {
        initialConduct[level] = {
          semester1: "A",
          semester2: "A",
          quarter1: "A",
          quarter2: "A",
          quarter3: "A",
          quarter4: "A",
          yearAvg: "A",
        };
      } else {
        initialConduct[level] = {
          semester1: "A",
          semester2: "A",
          yearAvg: "A",
        };
      }
    });
    setConduct(initialConduct);

    // Combine predefined and custom subjects
    const allSubjects = [...PREDEFINED_SUBJECTS, ...customSubjects];
    
    return allSubjects.map((subject) => {
      const existingGrade = student.grades?.find((g) => g.subject === subject);
      const grades: { [gradeLevel: string]: any } = {};

      gradeLevels.forEach((level) => {
        if (isQuarter) {
          grades[level] = existingGrade?.grades?.[level] || {
            semester1: 0,
            semester2: 0,
            quarter1: 0,
            quarter2: 0,
            quarter3: 0,
            quarter4: 0,
            yearAvg: 0,
            total: 0,
          };
        } else {
          grades[level] = existingGrade?.grades?.[level] || {
            semester1: 0,
            semester2: 0,
            yearAvg: 0,
            total: 0,
          };
        }
      });

      return {
        subject,
        grades,
      };
    });
  };

  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    console.log("[v0] useEffect triggered, student changed:", student?.name);
    try {
      const initializedGrades = initializeGrades();
      console.log(
        "[v0] Initialized grades:",
        initializedGrades.length,
        "subjects"
      );
      setGrades(initializedGrades);
    } catch (error) {
      console.error("[v0] Error initializing grades:", error);
      setGrades([]);
    }
  }, [student]);

  const calculateYearAvg = (values: number[]): number => {
    const nonZeroValues = values.filter(v => v > 0);
    if (nonZeroValues.length === 0) return 0;
    const sum = nonZeroValues.reduce((a, b) => a + b, 0);
    return Number((sum / nonZeroValues.length).toFixed(2));
  };

  const isQuarterSystem = student.termSystem === "quarter";
  const termLabels = isQuarterSystem 
    ? ["Q1", "Q2", "Q3", "Q4"] 
    : ["Sem 1", "Sem 2"];
  const termFields = isQuarterSystem
    ? ["quarter1", "quarter2", "quarter3", "quarter4"] as const
    : ["semester1", "semester2"] as const;

  const validateGrade = (value: string): number => {
    const numValue = Number.parseFloat(value) || 0;
    return Math.min(Math.max(numValue, 0), 100); // Limit between 0 and 100
  };

  type GradeField = "semester1" | "semester2" | "quarter1" | "quarter2" | "quarter3" | "quarter4" | "yearAvg" | "total";
  
  const updateGrade = (
    subjectIndex: number,
    gradeLevel: string,
    field: GradeField,
    value: string | number
  ) => {
    console.log("[v0] Updating grade:", subjectIndex, gradeLevel, field, value);
  
    setGrades((prev) => {
      const updated = [...prev];
  
      if (subjectIndex < 0 || subjectIndex >= updated.length) {
        console.error("[v0] Invalid subject index:", subjectIndex);
        return prev;
      }
  
      const numValue = typeof value === "string" ? validateGrade(value) : value;
      updated[subjectIndex].grades[gradeLevel][field] = numValue;
  
      // Calculate year average based on term system
      const gradeData = updated[subjectIndex].grades[gradeLevel];
      if (isQuarterSystem) {
        const q1 = gradeData.quarter1 || 0;
        const q2 = gradeData.quarter2 || 0;
        const q3 = gradeData.quarter3 || 0;
        const q4 = gradeData.quarter4 || 0;
        updated[subjectIndex].grades[gradeLevel].yearAvg = calculateYearAvg([q1, q2, q3, q4]);
        updated[subjectIndex].grades[gradeLevel].total = Number((q1 + q2 + q3 + q4).toFixed(2));
      } else {
        const sem1 = gradeData.semester1 || 0;
        const sem2 = gradeData.semester2 || 0;
        updated[subjectIndex].grades[gradeLevel].yearAvg = calculateYearAvg([sem1, sem2]);
        updated[subjectIndex].grades[gradeLevel].total = Number((sem1 + sem2).toFixed(2));
      }
  
      return updated;
    });
  };

  const updateEditableTotal = (
    gradeLevel: string,
    field: string,
    value: string
  ) => {
    const numValue = Number.parseFloat(value) || 0;
    setEditableTotals((prev) => ({
      ...prev,
      [`${gradeLevel}-${field}`]: numValue,
    }));
  };

  const calculateGradeLevelTotals = (gradeLevel: string) => {
    const totals: { [key: string]: number } = {
      semester1: 0,
      semester2: 0,
      quarter1: 0,
      quarter2: 0,
      quarter3: 0,
      quarter4: 0,
      yearAvg: 0,
      total: 0,
    };

    let subjectCount = 0;

    grades.forEach((grade) => {
      const gradeData = grade.grades[gradeLevel];
      if (!gradeData) return;
      
      // Check if any term has data
      const hasData = isQuarterSystem
        ? (gradeData.quarter1 || 0) > 0 || (gradeData.quarter2 || 0) > 0 || (gradeData.quarter3 || 0) > 0 || (gradeData.quarter4 || 0) > 0
        : (gradeData.semester1 || 0) > 0 || (gradeData.semester2 || 0) > 0;
      
      if (hasData) {
        if (isQuarterSystem) {
          totals.quarter1 += gradeData.quarter1 || 0;
          totals.quarter2 += gradeData.quarter2 || 0;
          totals.quarter3 += gradeData.quarter3 || 0;
          totals.quarter4 += gradeData.quarter4 || 0;
        } else {
          totals.semester1 += gradeData.semester1 || 0;
          totals.semester2 += gradeData.semester2 || 0;
        }
        totals.yearAvg += gradeData.yearAvg || 0;
        totals.total += gradeData.total || 0;
        subjectCount++;
      }
    });

    // Build final totals dynamically based on term system
    const finalTotals: { [key: string]: number } = {
      yearAvg:
        editableTotals[`${gradeLevel}-yearAvg-total`] ??
        Number(totals.yearAvg.toFixed(2)),
      total:
        editableTotals[`${gradeLevel}-total-total`] ??
        Number(totals.total.toFixed(2)),
      yearAvgAvg:
        editableTotals[`${gradeLevel}-yearAvg-avg`] ??
        (subjectCount > 0
          ? Number((totals.yearAvg / subjectCount).toFixed(2))
          : 0),
      subjectCount,
    };

    // Add term-specific totals and averages
    termFields.forEach((field) => {
      finalTotals[field] =
        editableTotals[`${gradeLevel}-${field}-total`] ??
        Number(totals[field].toFixed(2));
      finalTotals[`${field}Avg`] =
        editableTotals[`${gradeLevel}-${field}-avg`] ??
        (subjectCount > 0
          ? Number((totals[field] / subjectCount).toFixed(2))
          : 0);
    });

    return finalTotals;
  };

  const PREDEFINED_SUBJECTS = [
    "Amharic",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "History",
    "Civics",
    "Economics",
    "Agriculture",
    "HPE",
    "ICT",
  ];

  // Add custom subject
  const addCustomSubject = () => {
    const trimmedName = newSubjectName.trim();
    if (!trimmedName) return;
    
    // Check if subject already exists
    const allSubjects = [...PREDEFINED_SUBJECTS, ...customSubjects];
    if (allSubjects.some(s => s.toLowerCase() === trimmedName.toLowerCase())) {
      alert("This subject already exists!");
      return;
    }
    
    setCustomSubjects(prev => [...prev, trimmedName]);
    setNewSubjectName("");
    
    // Also add to grades with empty values
    const gradeLevels = getGradeLevels(student.template);
    setGrades(prev => [
      ...prev,
      {
        subject: trimmedName,
        grades: gradeLevels.reduce((acc, level) => {
          acc[level] = isQuarterSystem
            ? { semester1: 0, semester2: 0, quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0, yearAvg: 0, total: 0 }
            : { semester1: 0, semester2: 0, yearAvg: 0, total: 0 };
          return acc;
        }, {} as { [key: string]: any })
      }
    ]);
  };

  // Delete subject from a specific grade level
  const deleteSubjectFromGrade = (gradeLevel: string, subject: string) => {
    setDeletedSubjects(prev => ({
      ...prev,
      [gradeLevel]: [...(prev[gradeLevel] || []), subject]
    }));
  };

  // Restore a deleted subject for a grade level
  const restoreSubjectForGrade = (gradeLevel: string, subject: string) => {
    setDeletedSubjects(prev => ({
      ...prev,
      [gradeLevel]: (prev[gradeLevel] || []).filter(s => s !== subject)
    }));
  };

  // Check if subject is deleted for a grade level
  const isSubjectDeleted = (gradeLevel: string, subject: string): boolean => {
    return (deletedSubjects[gradeLevel] || []).includes(subject);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    gradeLevel: string,
    field: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      updateGrade(index, gradeLevel, field as GradeField, value);

      const nextIndex = index + 1;
      if (nextIndex < grades.length) {
        const nextInputKey = `${gradeLevel}-${nextIndex}-${field}`;
        const nextInput = inputRefs.current[nextInputKey];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

 

  const updateConduct = (gradeLevel: string, field: string, value: string) => {
    setConduct((prev) => ({
      ...prev,
      [gradeLevel]: {
        ...prev[gradeLevel],
        [field]: value,
      },
    }));
  };

  const handleSave = (isPartial: boolean) => {
    setIsSaving(true);

    const updatedStudent = {
      ...student,
      grades,
      conduct: conduct,
      customSubjects,
      deletedSubjects,
    };
    onSave(updatedStudent);
    setIsSaving(false);
console.log(updatedStudent)
    // Show Grade Saved popup
    const popup = document.createElement("div");
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px 40px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: #16a34a;
        text-align: center;
      ">
        ✓ Grade Saved
      </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
    }, 2000);
  };

  if (!student) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No student selected</p>
        </CardContent>
      </Card>
    );
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading grades...</p>
        </CardContent>
      </Card>
    );
  }

  const gradeLevels = getGradeLevels(student.template);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grades for {student.name}</span>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Template: {student.template} | {isQuarterSystem ? "Quarters" : "Semesters"}
            </div>
            
          </div>
        </CardTitle>
      </CardHeader>
        {/* Custom Subject Section */}
        <div className="p-4 m-4 border rounded-lg bg-blue-50">
          <h4 className="font-semibold mb-3">Add Custom Subject</h4>
          <div className="flex gap-2">
            <Input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter new subject name..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSubject();
                }
              }}
            />
            <Button onClick={addCustomSubject} className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Subject
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Custom subjects will be added to all grade levels
          </p>
        </div>
      <CardContent className="space-y-6">
        {gradeLevels.map((gradeLevel) => {
          const levelTotals = calculateGradeLevelTotals(gradeLevel);

          return (
            <div key={gradeLevel} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {gradeLevel} Academic Record
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Subject</TableHead>
                      {termLabels.map((label) => (
                        <TableHead key={label} className="text-center">{label}</TableHead>
                      ))}
                      <TableHead className="text-center">Year Avg</TableHead>
                      <TableHead className="w-[60px] text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.filter(grade => !isSubjectDeleted(gradeLevel, grade.subject)).map((grade, index) => (
                      <TableRow key={`${gradeLevel}-${grade.subject}`}>
                        <TableCell className="font-medium">
                          {grade.subject}
                          {customSubjects.includes(grade.subject) && (
                            <span className="ml-1 text-xs text-blue-500">(custom)</span>
                          )}
                        </TableCell>
                        {termFields.map((field) => {
                          const actualIndex = grades.findIndex(g => g.subject === grade.subject);
                          return (
                            <TableCell key={field}>
                              <Input
                                ref={(el) => {
                                  inputRefs.current[
                                    `${gradeLevel}-${actualIndex}-${field}`
                                  ] = el;
                                }}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={grade.grades[gradeLevel]?.[field] || ""}
                                onChange={(e) =>
                                  updateGrade(
                                    actualIndex,
                                    gradeLevel,
                                    field as GradeField,
                                    e.target.value
                                  )
                                }
                                onKeyPress={(e) =>
                                  handleKeyPress(e, actualIndex, gradeLevel, field)
                                }
                                className="text-center border-0 p-2 focus:ring-1 font-mono"
                                placeholder="0.00"
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.yearAvg || ""}
                            onChange={(e) =>
                              updateGrade(
                                grades.findIndex(g => g.subject === grade.subject),
                                gradeLevel,
                                "yearAvg",
                                e.target.value
                              )
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubjectFromGrade(gradeLevel, grade.subject)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                            title={`Remove ${grade.subject} from ${gradeLevel}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell className="font-bold">TOTALS</TableCell>
                      {termFields.map((field) => (
                        <TableCell key={`total-${field}`}>
                          <Input
                            type="number"
                            step="0.01"
                            value={levelTotals[field] || 0}
                            onChange={(e) =>
                              updateEditableTotal(
                                gradeLevel,
                                `${field}-total`,
                                e.target.value
                              )
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.yearAvg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "yearAvg-total",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-50 font-semibold">
                      <TableCell className="font-bold">AVERAGES</TableCell>
                      {termFields.map((field) => (
                        <TableCell key={`avg-${field}`}>
                          <Input
                            type="number"
                            step="0.01"
                            value={levelTotals[`${field}Avg`] || 0}
                            onChange={(e) =>
                              updateEditableTotal(
                                gradeLevel,
                                `${field}-avg`,
                                e.target.value
                              )
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.yearAvgAvg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "yearAvg-avg",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    <TableRow className="bg-green-50 font-semibold">
                      <TableCell className="font-bold">CONDUCT</TableCell>
                      {termFields.map((field) => (
                        <TableCell key={`conduct-${field}`}>
                          <Select
                            value={conduct[gradeLevel]?.[field] || "A"}
                            onValueChange={(value) =>
                              updateConduct(gradeLevel, field, value)
                            }
                          >
                            <SelectTrigger className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Select
                          value={conduct[gradeLevel]?.yearAvg || "A"}
                          onValueChange={(value) =>
                            updateConduct(gradeLevel, "yearAvg", value)
                          }
                        >
                          <SelectTrigger className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Deleted Subjects for this Grade Level */}
              {(deletedSubjects[gradeLevel] || []).length > 0 && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-2">Removed subjects (click to restore):</p>
                  <div className="flex flex-wrap gap-2">
                    {(deletedSubjects[gradeLevel] || []).map((subject) => (
                      <Button
                        key={subject}
                        variant="outline"
                        size="sm"
                        onClick={() => restoreSubjectForGrade(gradeLevel, subject)}
                        className="text-red-600 border-red-300 hover:bg-red-100"
                      >
                        {subject} <Plus className="w-3 h-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}


        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save All Grades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
