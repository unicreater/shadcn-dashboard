// app/api/inventory/template/route.ts
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create sample data for the template
    const templateData = [
      {
        "Product Name": "Example Product 1",
        Location: "WAREHOUSE-A",
        Quantity: 100,
        Reason: "Stock replenishment",
      },
      {
        "Product Name": "Example Product 2",
        Location: "WAREHOUSE-B",
        Quantity: 50,
        Reason: "Inventory adjustment",
      },
      {
        "Product Name": "Example Product 3",
        Location: "WAREHOUSE-A",
        Quantity: 25,
        Reason: "Initial stock",
      },
    ];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Product Name
      { wch: 15 }, // Location
      { wch: 10 }, // Quantity
      { wch: 30 }, // Reason
    ];
    worksheet["!cols"] = columnWidths;

    // Add some styling and instructions
    const instructionsSheet = XLSX.utils.aoa_to_sheet([
      ["INVENTORY UPLOAD TEMPLATE - INSTRUCTIONS"],
      [""],
      ["REQUIRED COLUMNS:"],
      [
        "1. Product Name - Must match exactly with existing product names in the system",
      ],
      [
        "2. Location - Must match exactly with existing location codes (e.g., WAREHOUSE-A, STORE-001)",
      ],
      ["3. Quantity - Must be a positive number (0 or greater)"],
      ["4. Reason - Text explanation for the inventory adjustment"],
      [""],
      ["UPLOAD TYPES:"],
      ["• Add Quantities: Excel quantity will be ADDED to current stock"],
      ["  Example: Current stock = 10, Excel = 20, Result = 30"],
      [""],
      ["• Replace Quantities: Excel quantity will REPLACE current stock"],
      ["  Example: Current stock = 10, Excel = 20, Result = 20"],
      [""],
      ["IMPORTANT NOTES:"],
      ["• Remove the sample data before uploading"],
      [
        "• Product names and locations are case-insensitive but must match exactly",
      ],
      ["• Each row represents one inventory adjustment"],
      ["• Maximum file size: 10MB"],
      ["• Supported formats: .xlsx, .xls"],
      [""],
      ["SAMPLE DATA:"],
      ['The "Sample Data" sheet contains example entries to guide you.'],
      [
        "Delete these entries and replace with your actual data before uploading.",
      ],
    ]);

    // Set column width for instructions
    instructionsSheet["!cols"] = [{ wch: 80 }];

    // Add both sheets to workbook
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      cellStyles: true,
    });

    // Create response with proper headers
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="inventory-upload-template.xlsx"',
        "Content-Length": excelBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error("Error generating Excel template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate Excel template",
      },
      { status: 500 }
    );
  }
}
