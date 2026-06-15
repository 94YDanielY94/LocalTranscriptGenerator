"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Edit2 } from "lucide-react"
import type { Student } from "@/app/page"

interface StudentFormProps {
  student: Student | null
  onSave: (student: Student) => void
}

export function StudentForm({ student, onSave }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "Male" | "Female" | "",
    age: "",
    template: "G9-G12" as Student["template"],
    termSystem: "semester" as "semester" | "quarter",
  })

  const [nameError, setNameError] = useState("")
  const [useManualYear, setUseManualYear] = useState(false)
  const [manualStartYear, setManualStartYear] = useState("")
  const [manualEndYear, setManualEndYear] = useState("")

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        gender: student.gender,
        age: student.age.toString(),
        template: student.template,
        termSystem: student.termSystem || "semester",
      })
      // Check if student has custom academic years
      if (student.academicYears) {
        const autoCalculated = calculateAcademicYears(student.template)
        if (student.academicYears !== autoCalculated) {
          setUseManualYear(true)
          const [start, end] = student.academicYears.split("-")
          setManualStartYear(start || "")
          setManualEndYear(end || "")
        } else {
          setUseManualYear(false)
          setManualStartYear("")
          setManualEndYear("")
        }
      } else {
        setUseManualYear(false)
        setManualStartYear("")
        setManualEndYear("")
      }
    } else {
      setFormData({
        name: "",
        gender: "",
        age: "",
        template: "G9-G12",
        termSystem: "semester",
      })
      setUseManualYear(false)
      setManualStartYear("")
      setManualEndYear("")
    }
  }, [student])

  const validateAndCapitalizeName = (name: string): { isValid: boolean; capitalizedName: string; error: string } => {
    const trimmedName = name.trim()

    // Check if name has at least 3 parts (first, middle, last)
    const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0)

    if (nameParts.length < 3) {
      return {
        isValid: false,
        capitalizedName: trimmedName,
        error: "Please enter full name (First Middle Last)",
      }
    }

    // Check if each part contains only letters
    const nameRegex = /^[a-zA-Z]+$/
    const invalidParts = nameParts.filter((part) => !nameRegex.test(part))

    if (invalidParts.length > 0) {
      return {
        isValid: false,
        capitalizedName: trimmedName,
        error: "Name should contain only letters",
      }
    }

    // Capitalize each part
    const capitalizedName = nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")

    return {
      isValid: true,
      capitalizedName,
      error: "",
    }
  }

  const getAgeRestrictions = (): { min: number } => {
    // Only restrict ages under 10 for safety
    return { min: 10 }
  }

  const calculateAcademicYears = (template: Student["template"]): string => {
    const currentYear = new Date().getFullYear()
    const templateYears = {
      "G9-G12": 4,
      "G10-G12": 3,
      "G11-G12": 2,
      G12: 1,
    }
    const years = templateYears[template]
    const startYear = currentYear - years + 1
    return `${startYear}-${currentYear}`
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.value
    setFormData((prev) => ({ ...prev, name: inputName }))

    if (inputName.trim()) {
      const validation = validateAndCapitalizeName(inputName)
      setNameError(validation.error)
    } else {
      setNameError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.gender || !formData.age) {
      alert("Please fill in all fields")
      return
    }

    const nameValidation = validateAndCapitalizeName(formData.name)
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error)
      return
    }

    const ageRestrictions = getAgeRestrictions()
    const age = Number.parseInt(formData.age)
    if (age < ageRestrictions.min) {
      alert(`Age must be at least ${ageRestrictions.min} years old`)
      return
    }

    // Determine academic years
    let academicYears: string
    if (useManualYear && manualStartYear && manualEndYear) {
      academicYears = `${manualStartYear}-${manualEndYear}`
    } else {
      academicYears = calculateAcademicYears(formData.template)
    }

    const studentData: Student = {
      id: student?.id || Date.now().toString(),
      name: nameValidation.capitalizedName, // Use capitalized name
      gender: formData.gender as "Male" | "Female",
      age: age,
      template: formData.template,
      termSystem: formData.termSystem,
      academicYears,
      grades: student?.grades || [],
      customSubjects: student?.customSubjects || [],
      deletedSubjects: student?.deletedSubjects || {},
    }

    onSave(studentData)
  }

  const currentAgeRestrictions = getAgeRestrictions()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student ? `Edit ${student.name}` : "New Student Information"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter student's full name (First Middle Last)"
                required
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              <p className="text-xs text-muted-foreground">Must include first, middle, and last name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as "Male" | "Female" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                min={currentAgeRestrictions.min}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum age: {currentAgeRestrictions.min} years
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Transcript Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, template: value as Student["template"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G9-G12">G9–G12 (4 years)</SelectItem>
                  <SelectItem value="G10-G12">G10–G12 (3 years)</SelectItem>
                  <SelectItem value="G11-G12">G11–G12 (2 years)</SelectItem>
                  <SelectItem value="G12">G12 only (1 year)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="termSystem">Term System</Label>
              <Select
                value={formData.termSystem}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, termSystem: value as "semester" | "quarter" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester">Semester (2 terms per year)</SelectItem>
                  <SelectItem value="quarter">Quarter (4 terms per year)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.termSystem === "quarter" ? "Q1, Q2, Q3, Q4 per grade" : "Sem 1, Sem 2 per grade"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Academic Years</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (useManualYear) {
                    // Switch to auto mode
                    setUseManualYear(false)
                    setManualStartYear("")
                    setManualEndYear("")
                  } else {
                    // Switch to manual mode - prefill with auto values
                    const autoYears = calculateAcademicYears(formData.template)
                    const [start, end] = autoYears.split("-")
                    setManualStartYear(start)
                    setManualEndYear(end)
                    setUseManualYear(true)
                  }
                }}
                className="flex items-center gap-1"
              >
                {useManualYear ? (
                  <><Calculator className="w-3 h-3" /> Auto Calculate</>
                ) : (
                  <><Edit2 className="w-3 h-3" /> Manual Entry</>
                )}
              </Button>
            </div>
            
            {useManualYear ? (
              <div className="p-3 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={manualStartYear}
                    onChange={(e) => setManualStartYear(e.target.value)}
                    placeholder="Start Year"
                    className="w-28 font-mono"
                    min={1900}
                    max={2100}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={manualEndYear}
                    onChange={(e) => setManualEndYear(e.target.value)}
                    placeholder="End Year"
                    className="w-28 font-mono"
                    min={1900}
                    max={2100}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Manual entry mode - enter custom academic years
                </p>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-mono">{calculateAcademicYears(formData.template)}</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on current year ({new Date().getFullYear()}) and selected template
                </p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            {student ? "Update Student" : "Save Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
