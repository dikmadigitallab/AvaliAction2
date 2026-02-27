"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Building2,
  UserPlus,
  Search,
} from "lucide-react"
import {
  fetchCompanies,
  fetchSupervisors,
  createSupervisor,
  editSupervisor,
  removeSupervisor,
  createCompany,
} from "@/lib/api"
import type { Company, Supervisor } from "@/lib/types"
import { toast } from "sonner"

export function SupervisorManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [allSupervisors, setAllSupervisors] = useState<Supervisor[]>([])
  const [filterCompany, setFilterCompany] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Add supervisor
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCompanyId, setNewCompanyId] = useState("")

  // Edit supervisor
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editId, setEditId] = useState("")
  const [editName, setEditName] = useState("")

  // Delete supervisor
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [deleteName, setDeleteName] = useState("")

  // Add company
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState("")

  const refreshData = async () => {
    try {
      const [c, s] = await Promise.all([fetchCompanies(), fetchSupervisors()])
      setCompanies(c)
      setAllSupervisors(s)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const filtered = allSupervisors
    .filter((s) => (filterCompany === "all" ? true : s.companyId === filterCompany))
    .filter((s) =>
      searchTerm
        ? s.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "N/A"
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Insira o nome do supervisor.")
      return
    }
    if (!newCompanyId) {
      toast.error("Selecione a empresa.")
      return
    }
    try {
      await createSupervisor(newName.trim(), newCompanyId)
      toast.success("Supervisor adicionado com sucesso!")
      setShowAddDialog(false)
      setNewName("")
      setNewCompanyId("")
      refreshData()
    } catch {
      toast.error("Erro ao adicionar supervisor.")
    }
  }

  const handleEdit = async () => {
    if (!editName.trim()) {
      toast.error("Insira o nome do supervisor.")
      return
    }
    try {
      await editSupervisor(editId, editName.trim())
      toast.success("Supervisor atualizado!")
      setShowEditDialog(false)
      refreshData()
    } catch {
      toast.error("Erro ao atualizar supervisor.")
    }
  }

  const handleDelete = async () => {
    try {
      await removeSupervisor(deleteId)
      toast.success("Supervisor removido.")
      setShowDeleteDialog(false)
      refreshData()
    } catch {
      toast.error("Erro ao remover supervisor.")
    }
  }

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error("Insira o nome da empresa.")
      return
    }
    try {
      await createCompany(newCompanyName.trim())
      toast.success("Empresa adicionada!")
      setShowAddCompanyDialog(false)
      setNewCompanyName("")
      refreshData()
    } catch {
      toast.error("Erro ao adicionar empresa.")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Supervisores</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gerencie supervisores e empresas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowAddCompanyDialog(true)}
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Empresa</span>
          </Button>
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Supervisor</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar supervisor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    {c.logo ? (
                      <Image
                        src={c.logo}
                        alt={c.name}
                        width={80}
                        height={30}
                        className="h-5 w-auto"
                      />
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Users className="h-5 w-5 text-primary" />
            Lista de Supervisores
            <Badge variant="secondary" className="ml-2">
              {filtered.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sup) => (
                    <TableRow key={sup.id}>
                      <TableCell className="font-medium">{sup.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCompanyName(sup.companyId)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditId(sup.id)
                              setEditName(sup.name)
                              setShowEditDialog(true)
                            }}
                            aria-label={`Editar ${sup.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(sup.id)
                              setDeleteName(sup.name)
                              setShowDeleteDialog(true)
                            }}
                            aria-label={`Remover ${sup.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum supervisor encontrado.</p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar supervisor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Supervisor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Supervisor</DialogTitle>
            <DialogDescription>
              Adicione um novo supervisor a uma empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Nome do supervisor"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          <Select value={newCompanyId} onValueChange={setNewCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      {c.logo ? (
                        <Image
                          src={c.logo}
                          alt={c.name}
                          width={80}
                          height={30}
                          className="h-5 w-auto"
                        />
                      ) : (
                        <span>{c.name}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supervisor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Supervisor</DialogTitle>
            <DialogDescription>
              Atualize o nome do supervisor.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nome do supervisor"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Supervisor Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Remover Supervisor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o supervisor{" "}
              <strong>{deleteName}</strong>? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Empresa</DialogTitle>
            <DialogDescription>
              Adicione uma nova empresa a plataforma.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nome da empresa"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAddCompanyDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCompany}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
