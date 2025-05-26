"use client";

import { ChevronDown, Copy, MoreVertical, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { AgentPolicy } from "@/components/model/model";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { columns } from "@/app/(main)/(pages)/agentpolicies/columns";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface DataTableProps {
  data: AgentPolicy[];
  // weeklyProfit: { currentWeekTotalCost: number; weekPercentageChange: string };
  // monthlyProfit: {
  //   currentMonthTotalCost: number;
  //   monthPercentageChange: string;
  // };
}

const ITEMS_PER_PAGE = 10; // Define how many records per page

export default function AgentPolicyTable({
  data,
}: // weeklyProfit,
// monthlyProfit,
DataTableProps) {
  const [selectedCard, setSelectedCard] = useState<AgentPolicy>(data[0]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const dataDetails = data;

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Get paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle page change
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter agent code..."
              value={
                (table.getColumn("code")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("code")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Agent Policy</CardTitle>
                <CardDescription>
                  Agent policies from your store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => {
                        const handleRowClick = () => {
                          setSelectedCard(row.original);
                        };
                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={handleRowClick}
                            className={`
                                ${
                                  row.original.id === (selectedCard?.id || 0)
                                    ? "bg-accent"
                                    : ""
                                },
                            `}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <span>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        {selectedCard && (
          <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-3">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <div className="text-xl font-semibold">Items</div>
                <CardTitle className="group flex items-center gap-2 text-lg">
                  Agent Policy {selectedCard.code}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy Order ID</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Date: {selectedCard.created_date}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                    Track Policy
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                      <MoreVertical className="h-3.5 w-3.5" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Trash</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            {selectedCard.agent_policy_items && (
              <CardContent key={selectedCard.id} className="p-6 text-sm">
                <Table>
                  {/* <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => {
                            const handleRowClick = () => {
                              setSelectedCard(row.original);
                            };
                            return (
                              <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={handleRowClick}
                                className={`
                                ${
                                  row.original.id === (selectedCard?.id || 0)
                                    ? "bg-accent"
                                    : ""
                                },
                            `}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody> */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>Items</TableHead>
                      {/* <TableHead>Description</TableHead> */}
                      <TableHead className="hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Code
                      </TableHead>
                      {/* <TableHead className="hidden sm:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Brand
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Name
                      </TableHead> */}
                      {/* <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCard.agent_policy_items.map((item, i) => {
                      const handleRowClick = () => {
                        console.log(item);
                        // setSelectedCard(d);
                      };

                      return (
                        <TableRow
                          key={i}
                          className={cn(
                            "font-medium w-fit px-4 py-2 rounded-lg",
                            {
                              "bg-accent": item.id === (selectedCard?.id || 0),
                            }
                          )}
                          // onClick={handleRowClick}
                        >
                          <TableCell>
                            <div className="font-medium">{item.code}</div>
                          </TableCell>
                          {/* <TableCell>
                            <div className="font-medium">
                              {item.description}
                            </div>
                          </TableCell> */}
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              className={`px-4 py-1 rounded-md text-white w-fit inline-block ${
                                item.status === "10"
                                  ? "bg-green-500"
                                  : item.status === "20"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                              variant={`${
                                item.status === "10"
                                  ? "default"
                                  : item.status === "20"
                                  ? "outline"
                                  : "secondary"
                              }`}
                            >
                              {item.status === "10"
                                ? "Active"
                                : item.status === "20"
                                ? "Inactive"
                                : "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell capitalize`}
                          >
                            {String(item.type)}
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell capitalize}`}
                          >
                            {String(item.code)}
                          </TableCell>
                          {/* <TableCell
                            className={`hidden md:table-cell capitalize}`}
                          >
                            {String(item.product_type)}
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell capitalize}`}
                          >
                            {String(item.product_brand)}
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell capitalize}`}
                          >
                            {String(item.product_category)}
                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
