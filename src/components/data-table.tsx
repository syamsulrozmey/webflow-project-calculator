"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpRight,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ClockIcon,
  ColumnsIcon,
  Copy,
  Download,
  FileEdit,
  Globe,
  Layout,
  MoreVerticalIcon,
  PlusIcon,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["landing_page", "small_business", "ecommerce", "web_app"]),
  flow: z.enum(["fresh", "existing"]),
  status: z.enum(["draft", "in_progress", "completed"]),
  estimatedCost: z.number(),
  hours: z.number(),
  currency: z.string(),
  persona: z.enum(["freelancer", "agency", "company"]),
  updatedAt: z.string(),
})

type Project = z.infer<typeof projectSchema>

const typeIcons: Record<Project["type"], React.ReactNode> = {
  landing_page: <Layout className="h-3.5 w-3.5" />,
  small_business: <Globe className="h-3.5 w-3.5" />,
  ecommerce: <ShoppingCart className="h-3.5 w-3.5" />,
  web_app: <FileEdit className="h-3.5 w-3.5" />,
}

const typeLabels: Record<Project["type"], string> = {
  landing_page: "Landing Page",
  small_business: "Small Business",
  ecommerce: "Ecommerce",
  web_app: "Web App",
}

const statusConfig: Record<Project["status"], { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-amber-400/50 text-amber-300 bg-amber-400/10" },
  in_progress: { label: "In Progress", className: "border-blue-400/50 text-blue-300 bg-blue-400/10" },
  completed: { label: "Completed", className: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10" },
}

const flowLabels: Record<Project["flow"], string> = {
  fresh: "Fresh Build",
  existing: "Existing Site",
}

function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "title",
    header: "Project",
    cell: ({ row }) => {
      const project = row.original
      const status = statusConfig[project.status]
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{project.title}</span>
            <Badge variant="outline" className={`text-[10px] ${status.className}`}>
              {status.label}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {project.persona.charAt(0).toUpperCase() + project.persona.slice(1)}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{typeIcons[type]}</span>
          <span className="text-sm">{typeLabels[type]}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "flow",
    header: "Flow",
    cell: ({ row }) => (
      <Badge variant="outline" className="border-white/20 text-xs text-white/80">
        {flowLabels[row.original.flow]}
      </Badge>
    ),
  },
  {
    accessorKey: "estimatedCost",
    header: () => <div className="text-right">Est. Cost</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-white">
        {formatCurrency(row.original.estimatedCost, row.original.currency)}
      </div>
    ),
  },
  {
    accessorKey: "hours",
    header: () => <div className="text-right">Hours</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 text-muted-foreground">
        <ClockIcon className="h-3.5 w-3.5" />
        <span>{row.original.hours}</span>
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-white/80 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={`/questionnaire?projectId=${project.id}`}>
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Open
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 text-muted-foreground data-[state=open]:bg-white/10"
                size="icon"
              >
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-rose-400 focus:text-rose-300">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function DataTable({ data }: { data: Project[] }) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Count projects by status
  const statusCounts = React.useMemo(() => {
    return {
      all: data.length,
      completed: data.filter((p) => p.status === "completed").length,
      in_progress: data.filter((p) => p.status === "in_progress").length,
      draft: data.filter((p) => p.status === "draft").length,
    }
  }, [data])

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="sr-only">
            Filter by status
          </Label>
          <Select
            defaultValue="all"
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("title")?.setFilterValue(undefined)
              } else {
                // This is a simplified filter - in production you'd filter by status
                table.getColumn("title")?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="w-fit border-white/20" id="status-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects ({statusCounts.all})</SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" />
                  Completed ({statusCounts.completed})
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5 text-blue-400" />
                  In Progress ({statusCounts.in_progress})
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <FileEdit className="h-3.5 w-3.5 text-amber-400" />
                  Draft ({statusCounts.draft})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/20">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" asChild>
            <Link href="/questionnaire">
              <PlusIcon className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">New Project</span>
              <span className="lg:hidden">New</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-white/5 transition hover:bg-white/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <span>No projects found.</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/questionnaire">Create your first project</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredRowModel().rows.length} project(s) total
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium text-muted-foreground">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20 border-white/20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 border-white/20 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 border-white/20"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 border-white/20"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 border-white/20 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
