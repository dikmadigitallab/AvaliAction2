"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, GripVertical, Save, Star, AlignLeft } from "lucide-react"
import { toast } from "sonner"
import type { FormQuestion, QuestionType } from "@/lib/types"

interface FormBuilderProps {
  initialName?: string
  initialQuestions?: FormQuestion[]
  onSave: (name: string, questions: FormQuestion[]) => void
  submitLabel?: string
}

export function FormBuilder({
  initialName = "",
  initialQuestions = [],
  onSave,
  submitLabel = "Salvar formulario",
}: FormBuilderProps) {
  const [formName, setFormName] = useState(initialName)
  const [questions, setQuestions] = useState<FormQuestion[]>(initialQuestions)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  // New question state
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newQuestionType, setNewQuestionType] = useState<QuestionType | "">("")
  const [newMaxScore, setNewMaxScore] = useState("")

  const resetNewQuestion = () => {
    setNewQuestionText("")
    setNewQuestionType("")
    setNewMaxScore("")
    setIsAddingQuestion(false)
  }

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error("Informe o texto da pergunta.")
      return
    }
    if (!newQuestionType) {
      toast.error("Selecione o tipo da pergunta.")
      return
    }
    if (newQuestionType === "avaliacao" && (!newMaxScore || Number(newMaxScore) < 1)) {
      toast.error("Informe uma nota maxima valida (minimo 1).")
      return
    }

    const question: FormQuestion = {
      id: crypto.randomUUID(),
      text: newQuestionText.trim(),
      type: newQuestionType,
      tag: newQuestionType === "avaliacao" ? "avaliacao" : "texto",
      ...(newQuestionType === "avaliacao" ? { maxScore: Number(newMaxScore) } : {}),
    }

    setQuestions((prev) => [...prev, question])
    resetNewQuestion()
    toast.success("Pergunta adicionada.")
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleSubmit = () => {
    if (!formName.trim()) {
      toast.error("Informe o nome do formulario.")
      return
    }
    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta.")
      return
    }
    onSave(formName.trim(), questions)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Informacoes do formulario</CardTitle>
          <CardDescription>Defina o nome do formulario.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-name">Nome do formulario *</Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Avaliacao mensal de supervisores"
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-card-foreground">Perguntas</CardTitle>
              <CardDescription>
                {questions.length === 0
                  ? "Nenhuma pergunta adicionada ainda."
                  : `${questions.length} pergunta${questions.length !== 1 ? "s" : ""} adicionada${questions.length !== 1 ? "s" : ""}.`}
              </CardDescription>
            </div>
            {!isAddingQuestion && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsAddingQuestion(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar pergunta
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Existing questions */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{q.text}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        {q.type === "avaliacao" ? (
                          <Star className="h-3 w-3" />
                        ) : (
                          <AlignLeft className="h-3 w-3" />
                        )}
                        {q.type === "avaliacao" ? "Avaliacao" : "Texto"}
                      </Badge>
                      {q.type === "avaliacao" && q.maxScore && (
                        <Badge variant="outline" className="text-xs">
                          Nota max: {q.maxScore}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        Tag: {q.tag}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    onClick={() => handleRemoveQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover pergunta</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add question form */}
          {isAddingQuestion && (
            <>
              {questions.length > 0 && <Separator />}
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                <p className="mb-4 text-sm font-medium text-foreground">Nova pergunta</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="q-text">Texto da pergunta *</Label>
                    <Input
                      id="q-text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Ex: Como voce avalia a comunicacao do supervisor?"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Tipo da pergunta *</Label>
                    <Select
                      value={newQuestionType}
                      onValueChange={(v) => setNewQuestionType(v as QuestionType)}
                    >
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avaliacao">Avaliacao</SelectItem>
                        <SelectItem value="texto">Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newQuestionType === "avaliacao" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="q-max-score">Nota maxima *</Label>
                      <Input
                        id="q-max-score"
                        type="number"
                        min={1}
                        max={10}
                        value={newMaxScore}
                        onChange={(e) => setNewMaxScore(e.target.value)}
                        placeholder="Ex: 5"
                        className="w-full sm:w-32"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" className="gap-2" onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetNewQuestion}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button className="gap-2" size="lg" onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
