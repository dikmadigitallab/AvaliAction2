"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  Star,
  AlignLeft,
  Settings2,
  Share2,
  Users,
} from "lucide-react"
import { getForms, addForm, deleteForm, getFormResponsesByFormId } from "@/lib/store"
import type { FormTemplate, FormQuestion } from "@/lib/types"
import { encodeFormForURL } from "@/lib/form-share"
import { FormBuilder } from "@/components/form-builder"
import { toast } from "sonner"

export default function FormulariosPage() {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FormTemplate | null>(null)
  const router = useRouter()

  useEffect(() => {
    setForms(getForms())
  }, [])

  const refreshForms = () => {
    setForms(getForms())
  }

  const handleCreate = (name: string, questions: FormQuestion[]) => {
    const newForm = addForm(name, questions)
    refreshForms()
    setShowCreateDialog(false)
    toast.success("Formulario criado com sucesso!")
    router.push(`/admin/formularios/${newForm.id}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteForm(deleteTarget.id)
    refreshForms()
    setDeleteTarget(null)
    toast.success("Formulario excluido.")
  }

  const handleCopyLink = (formId: string) => {
    const form = forms.find((f) => f.id === formId)
    if (!form) return
    const encoded = encodeFormForURL(form)
    const url = `${window.location.origin}/responder/${formId}?d=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado para a area de transferencia!")
    }).catch(() => {
      toast.error("Nao foi possivel copiar o link.")
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formularios</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus formularios de avaliacao.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Novo formulario
        </Button>
      </div>

      {/* Forms list */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum formulario criado
            </p>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro formulario para comecar a coletar avaliacoes.
            </p>
            <Button
              variant="outline"
              className="mt-2 gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Criar formulario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
            .map((form) => {
              const ratingCount = form.questions.filter(
                (q) => q.type === "avaliacao"
              ).length
              const textCount = form.questions.filter(
                (q) => q.type === "texto"
              ).length
              const responseCount = getFormResponsesByFormId(form.id).length

              return (
                <Card
                  key={form.id}
                  className="group relative transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-card-foreground truncate">
                          {form.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          Criado em{" "}
                          {new Date(form.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => handleCopyLink(form.id)}
                        title="Compartilhar formulario"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Compartilhar formulario</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {/* Question stats */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        {form.questions.length} pergunta
                        {form.questions.length !== 1 ? "s" : ""}
                      </Badge>
                      {ratingCount > 0 && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Star className="h-3 w-3" />
                          {ratingCount} avaliacao
                        </Badge>
                      )}
                      {textCount > 0 && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <AlignLeft className="h-3 w-3" />
                          {textCount} texto
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        {responseCount} resposta{responseCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() =>
                          router.push(`/admin/formularios/${form.id}`)
                        }
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Configurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() =>
                          router.push(`/admin/formularios/${form.id}?edit=true`)
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(form)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir formulario</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo formulario</DialogTitle>
          </DialogHeader>
          <FormBuilder onSave={handleCreate} submitLabel="Salvar formulario" />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulario</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o formulario{" "}
              <strong>{deleteTarget?.name}</strong>? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
