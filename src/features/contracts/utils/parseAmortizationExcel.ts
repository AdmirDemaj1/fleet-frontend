import * as XLSX from "xlsx";

export interface AmortizationScheduleEntry {
  paymentNumber: number;
  month: string; // ISO date string
  beginningBalance: number;
  monthlyInterestAmount: number;
  principalRepayment: number;
  monthlyMortgagePayment: number;
  endingBalance: number;
  paidAmount?: number | null;
  paymentDate?: string | null; // ISO date string
}

export interface AmortizationHeaderData {
  currency?: string;
  creditAmount?: number;
  interestRate?: number; // As decimal (e.g., 0.06 for 6%)
  maturityYears?: number;
  maturityMonths?: number;
  monthlyMortgagePayments?: number;
  disbursementCommission?: number; // As decimal (e.g., 0.015 for 1.5%)
  commissionAmount?: number;
  interest?: number; // Total interest
  principal?: number;
  loanDate?: string; // ISO date string
  loanAmount?: number;
}

export interface AmortizationData {
  headerData: AmortizationHeaderData;
  scheduleOfPayments: AmortizationScheduleEntry[];
}

/**
 * Parse Excel file and extract multiple amortization schedules
 *
 * Expected structure (simplified, single-row headers):
 * Row 1: Currency | Credit Amount | Interest Rate (in %) | Maturity (in Years) | ...
 * Row 2: EUR | 20800 | 0.06 | 5 | 60 | 402.12 | 0.015 | 312
 * Row 3: INTEREST | 3327.34
 * Row 4: PRINCIPAL | 20800
 * Row 5: LOAN DATE | 07.12.2021
 * Row 6: LOAN AMOUNT | 24127.34
 * Row 7: (empty)
 * Row 8: Month | Beginning Monthly Balance | Monthly Interest Amount | ...
 * Row 9+: Schedule data
 *
 * Returns array of amortizations, each with headerData and scheduleOfPayments
 */
export const parseAmortizationExcel = async (
  file: File
): Promise<AmortizationData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Parse Excel file
        const workbook = XLSX.read(data, {
          type: "binary",
          cellDates: true,
          cellNF: false,
        });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("Excel file has no sheets"));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: false,
        }) as any[][];

        if (jsonData.length < 8) {
          reject(new Error("Excel file must have sufficient data"));
          return;
        }

        const amortizations: AmortizationData[] = [];
        let currentRow = 0;

        console.log(`📊 Parsing Excel with ${jsonData.length} rows`);

        // Parse each amortization section
        while (currentRow < jsonData.length) {
          // Step 1: Find header section
          // Look for row with "Currency" and "Credit Amount" in first columns
          let headerRow = -1;

          for (
            let i = currentRow;
            i < Math.min(currentRow + 50, jsonData.length);
            i++
          ) {
            const row = jsonData[i];
            if (!row) continue;

            const firstCells = row.slice(0, 8).map((cell) =>
              String(cell || "")
                .toLowerCase()
                .trim()
            );

            // Check if this is a header row with expected fields
            const hasCurrency = firstCells[0] === "currency";
            const hasCreditAmount =
              firstCells[1] === "credit amount" ||
              firstCells.some((c) => c === "credit amount");
            const hasInterestRate = firstCells.some((c) =>
              c.includes("interest rate")
            );

            if (hasCurrency && (hasCreditAmount || hasInterestRate)) {
              headerRow = i;
              console.log(`\n✅ Found header row at ${i + 1}`);
              break;
            }
          }

          if (headerRow === -1) {
            console.log(`No more sections found after row ${currentRow + 1}`);
            break;
          }

          // Step 2: Extract header data
          const headerData: AmortizationHeaderData = {};
          const headerLabelsRow = jsonData[headerRow] || [];
          const headerValuesRow = jsonData[headerRow + 1] || [];

          // Helper functions
          const parseNumber = (value: any): number | undefined => {
            if (value === null || value === undefined || value === "")
              return undefined;
            if (typeof value === "number") return value;
            if (typeof value === "string") {
              const cleaned = value.replace(/[^\d.-]/g, "");
              const parsed = parseFloat(cleaned);
              return isNaN(parsed) ? undefined : parsed;
            }
            return undefined;
          };

          const parseDate = (value: any): string | undefined => {
            if (!value) return undefined;

            if (value instanceof Date) {
              return value.toISOString().split("T")[0];
            }

            if (typeof value === "string") {
              // DD.MM.YYYY format
              const ddmmyyyyMatch = value.match(
                /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
              );
              if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch;
                return `${year}-${month.padStart(2, "0")}-${day.padStart(
                  2,
                  "0"
                )}`;
              }

              // Try standard parsing
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
              }
            }

            if (typeof value === "number") {
              // Excel serial date
              const excelEpoch = new Date(1899, 11, 30);
              const date = new Date(
                excelEpoch.getTime() + value * 24 * 60 * 60 * 1000
              );
              return date.toISOString().split("T")[0];
            }

            return undefined;
          };

          // Extract from horizontal header (row 1 labels, row 2 values)
          headerLabelsRow.forEach((label, index) => {
            if (!label) return;

            const normalizedLabel = String(label).toLowerCase().trim();
            const value = headerValuesRow[index];

            if (normalizedLabel === "currency") {
              headerData.currency = value
                ? String(value).trim().toUpperCase()
                : undefined;
            } else if (normalizedLabel === "credit amount") {
              headerData.creditAmount = parseNumber(value);
            } else if (normalizedLabel.includes("interest rate")) {
              headerData.interestRate = parseNumber(value);
            } else if (
              normalizedLabel.includes("maturity") &&
              normalizedLabel.includes("years")
            ) {
              headerData.maturityYears = parseNumber(value);
            } else if (
              normalizedLabel.includes("maturity") &&
              normalizedLabel.includes("months")
            ) {
              headerData.maturityMonths = parseNumber(value);
            } else if (normalizedLabel.includes("monthly mortgage payments")) {
              headerData.monthlyMortgagePayments = parseNumber(value);
            } else if (
              normalizedLabel.includes("disbursment") ||
              normalizedLabel.includes("disbursement")
            ) {
              headerData.disbursementCommission = parseNumber(value);
            } else if (
              normalizedLabel.includes("commision amount") ||
              normalizedLabel.includes("commission amount")
            ) {
              headerData.commissionAmount = parseNumber(value);
            }
          });

          // Extract from vertical fields (rows 3-6)
          for (
            let i = headerRow + 2;
            i < Math.min(headerRow + 7, jsonData.length);
            i++
          ) {
            const row = jsonData[i];
            if (!row) continue;

            const label = String(row[0] || "")
              .toLowerCase()
              .trim();
            const value = row[1];

            if (label === "interest") {
              headerData.interest = parseNumber(value);
            } else if (label === "principal") {
              headerData.principal = parseNumber(value);
            } else if (label === "loan date") {
              headerData.loanDate = parseDate(value);
            } else if (label === "loan amount") {
              headerData.loanAmount = parseNumber(value);
            }
          }

          console.log(`📋 Parsed header:`, {
            currency: headerData.currency,
            creditAmount: headerData.creditAmount,
            interestRate: headerData.interestRate,
            maturityYears: headerData.maturityYears,
            loanDate: headerData.loanDate,
          });

          // Step 3: Find schedule table header
          // Look for row with "Month" in first column
          let scheduleHeaderRow = -1;

          for (
            let i = headerRow + 6;
            i < Math.min(headerRow + 15, jsonData.length);
            i++
          ) {
            const row = jsonData[i];
            if (!row) continue;

            const firstCell = String(row[0] || "")
              .toLowerCase()
              .trim();

            if (firstCell === "month") {
              scheduleHeaderRow = i;
              console.log(`✅ Found schedule header at row ${i + 1}`);
              break;
            }
          }

          if (scheduleHeaderRow === -1) {
            console.warn(
              `⚠️ No schedule table found for section starting at row ${
                headerRow + 1
              }`
            );
            currentRow = headerRow + 20;
            continue;
          }

          // Step 4: Map schedule columns
          const scheduleHeaderLabels = jsonData[scheduleHeaderRow] || [];
          const scheduleColumnMap: Record<string, number> = {};

          scheduleHeaderLabels.forEach((label, index) => {
            if (!label) return;

            const normalized = String(label).toLowerCase().trim();

            if (normalized === "month") {
              scheduleColumnMap.month = index;
            } else if (
              normalized.includes("beginning") &&
              normalized.includes("balance")
            ) {
              scheduleColumnMap.beginningBalance = index;
            } else if (
              normalized.includes("monthly") &&
              normalized.includes("interest")
            ) {
              scheduleColumnMap.monthlyInterestAmount = index;
            } else if (
              normalized.includes("principal") &&
              normalized.includes("repayment")
            ) {
              scheduleColumnMap.principalRepayment = index;
            } else if (
              normalized.includes("monthly") &&
              normalized.includes("mortgage") &&
              normalized.includes("payment")
            ) {
              scheduleColumnMap.monthlyMortgagePayment = index;
            } else if (
              normalized.includes("ending") &&
              normalized.includes("balance")
            ) {
              scheduleColumnMap.endingBalance = index;
            } else if (normalized === "paid") {
              scheduleColumnMap.paid = index;
            } else if (normalized === "date" && !normalized.includes("month")) {
              scheduleColumnMap.paymentDate = index;
            }
          });

          // Validate required columns
          const requiredColumns = [
            "month",
            "beginningBalance",
            "monthlyInterestAmount",
            "principalRepayment",
            "monthlyMortgagePayment",
            "endingBalance",
          ];
          const missingColumns = requiredColumns.filter(
            (col) => scheduleColumnMap[col] === undefined
          );

          if (missingColumns.length > 0) {
            console.warn(`⚠️ Missing columns: ${missingColumns.join(", ")}`);
            currentRow = scheduleHeaderRow + 1;
            continue;
          }

          // Step 5: Parse schedule entries
          const scheduleEntries: AmortizationScheduleEntry[] = [];
          const dataStartRow = scheduleHeaderRow + 1;
          let lastParsedRow = dataStartRow - 1;

          for (let i = dataStartRow; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Check for empty row (end of section)
            if (!row || row.every((cell) => !cell)) {
              // Check if truly end of section (multiple empty rows)
              let emptyCount = 0;
              for (let j = i; j < Math.min(i + 3, jsonData.length); j++) {
                const checkRow = jsonData[j];
                if (!checkRow || checkRow.every((c) => !c)) emptyCount++;
              }
              if (emptyCount >= 2) {
                lastParsedRow = i;
                break;
              }
              continue;
            }

            // Check if we hit next section
            const firstCell = String(row[0] || "")
              .toLowerCase()
              .trim();
            if (firstCell === "currency") {
              lastParsedRow = i - 1;
              break;
            }

            // Extract values
            const getValue = (key: string): any => {
              const colIndex = scheduleColumnMap[key];
              if (colIndex === undefined) return null;
              return row[colIndex];
            };

            // Parse month
            const monthValue = getValue("month");
            if (!monthValue && monthValue !== 0) continue;

            let month: string;
            if (monthValue instanceof Date) {
              // Date object - format directly from local components to avoid timezone shifts
              const year = monthValue.getFullYear();
              const monthNum = monthValue.getMonth() + 1;
              const day = monthValue.getDate();
              month = `${year}-${String(monthNum).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;
            } else if (typeof monthValue === "string") {
              // Try DD/MM/YYYY format first (e.g., "07/01/2022" = January 7, 2022)
              // This is the European date format commonly used in Excel files
              const ddmmyyyyMatch = monthValue.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
              );
              if (ddmmyyyyMatch) {
                const [, day, monthStr, year] = ddmmyyyyMatch;
                // Format directly without creating Date object to avoid timezone issues
                month = `${year}-${String(monthStr).padStart(2, "0")}-${String(
                  day
                ).padStart(2, "0")}`;
              } else {
                // Handle "2022-01-07" or "2022-01-07 00:00:00" format
                const isoMatch = monthValue.match(/^(\d{4}-\d{2}-\d{2})/);
                if (isoMatch) {
                  month = isoMatch[1];
                } else {
                  // Try standard Date parsing
                  const date = new Date(monthValue);
                  if (!isNaN(date.getTime())) {
                    // Format from local components to avoid timezone shift
                    const year = date.getFullYear();
                    const monthNum = date.getMonth() + 1;
                    const day = date.getDate();
                    month = `${year}-${String(monthNum).padStart(
                      2,
                      "0"
                    )}-${String(day).padStart(2, "0")}`;
                  } else {
                    console.warn(`Could not parse date: ${monthValue}`);
                    continue;
                  }
                }
              }
            } else if (typeof monthValue === "number") {
              // Excel serial date number
              // Excel serial date system: January 1, 1900 = serial 1
              // Excel incorrectly treats 1900 as a leap year (includes Feb 29, 1900 which didn't exist)

              // Use Excel's epoch: Dec 30, 1899
              // Excel serial 1 = Jan 1, 1900 = 2 days after Dec 30, 1899
              const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 in local time
              const date = new Date(
                excelEpoch.getTime() + monthValue * 24 * 60 * 60 * 1000
              );

              // Format from local date components to avoid timezone shifts
              const year = date.getFullYear();
              const monthNum = date.getMonth() + 1;
              const day = date.getDate();

              month = `${year}-${String(monthNum).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;
              console.log(
                `  📅 Excel serial ${monthValue} -> ${month} (local: ${year}-${monthNum}-${day})`
              );
            } else {
              continue;
            }

            // Parse payment date
            let paymentDate: string | null = null;
            const paymentDateValue = getValue("paymentDate");

            if (paymentDateValue) {
              if (paymentDateValue instanceof Date) {
                // Date object - format directly from local components to avoid timezone shifts
                const year = paymentDateValue.getFullYear();
                const monthNum = paymentDateValue.getMonth() + 1;
                const day = paymentDateValue.getDate();
                paymentDate = `${year}-${String(monthNum).padStart(
                  2,
                  "0"
                )}-${String(day).padStart(2, "0")}`;
              } else if (typeof paymentDateValue === "string") {
                // Try DD-Mon-YY format first (e.g., "25-Jan-22")
                const ddMonYyMatch = paymentDateValue.match(
                  /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/i
                );
                if (ddMonYyMatch) {
                  const [, day, monthStr, yearStr] = ddMonYyMatch;
                  const monthNames = [
                    "jan",
                    "feb",
                    "mar",
                    "apr",
                    "may",
                    "jun",
                    "jul",
                    "aug",
                    "sep",
                    "oct",
                    "nov",
                    "dec",
                  ];
                  const monthIndex = monthNames.indexOf(monthStr.toLowerCase());
                  if (monthIndex !== -1) {
                    // Assume 20xx for 2-digit years
                    const fullYear = 2000 + parseInt(yearStr);
                    // Format directly without creating Date object to avoid timezone issues
                    paymentDate = `${fullYear}-${String(
                      monthIndex + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  } else {
                    // Fallback to Date parsing
                    const date = new Date(paymentDateValue);
                    if (!isNaN(date.getTime())) {
                      const year = date.getFullYear();
                      const monthNum = date.getMonth() + 1;
                      const day = date.getDate();
                      paymentDate = `${year}-${String(monthNum).padStart(
                        2,
                        "0"
                      )}-${String(day).padStart(2, "0")}`;
                    }
                  }
                } else {
                  // Try DD/MM/YYYY format (e.g., "25/01/2022" = January 25, 2022)
                  const ddmmyyyyMatch = paymentDateValue.match(
                    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
                  );
                  if (ddmmyyyyMatch) {
                    const [, day, monthStr, year] = ddmmyyyyMatch;
                    // Format directly without creating Date object to avoid timezone issues
                    paymentDate = `${year}-${String(monthStr).padStart(
                      2,
                      "0"
                    )}-${String(day).padStart(2, "0")}`;
                  } else {
                    // Handle "2022-01-07" or "2022-01-07 00:00:00" format
                    const isoMatch =
                      paymentDateValue.match(/^(\d{4}-\d{2}-\d{2})/);
                    if (isoMatch) {
                      paymentDate = isoMatch[1];
                    } else {
                      // Try standard Date parsing
                      const date = new Date(paymentDateValue);
                      if (!isNaN(date.getTime())) {
                        // Format from local components to avoid timezone shift
                        const year = date.getFullYear();
                        const monthNum = date.getMonth() + 1;
                        const day = date.getDate();
                        paymentDate = `${year}-${String(monthNum).padStart(
                          2,
                          "0"
                        )}-${String(day).padStart(2, "0")}`;
                      }
                    }
                  }
                }
              } else if (typeof paymentDateValue === "number") {
                // Excel serial date number
                const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 in local time
                const date = new Date(
                  excelEpoch.getTime() + paymentDateValue * 24 * 60 * 60 * 1000
                );

                // Format from local date components to avoid timezone shifts
                const year = date.getFullYear();
                const monthNum = date.getMonth() + 1;
                const day = date.getDate();

                paymentDate = `${year}-${String(monthNum).padStart(
                  2,
                  "0"
                )}-${String(day).padStart(2, "0")}`;
              }
            }

            // Parse numeric values
            const parseNumericValue = (value: any): number => {
              if (value === null || value === undefined || value === "")
                return 0;
              if (typeof value === "number") return value;
              if (typeof value === "string") {
                const cleaned = value.replace(/[^\d.-]/g, "");
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? 0 : parsed;
              }
              return 0;
            };

            const paidValue = getValue("paid");
            const paidAmount = paidValue ? parseNumericValue(paidValue) : null;

            const entry: AmortizationScheduleEntry = {
              paymentNumber: scheduleEntries.length + 1,
              month,
              beginningBalance: parseNumericValue(getValue("beginningBalance")),
              monthlyInterestAmount: parseNumericValue(
                getValue("monthlyInterestAmount")
              ),
              principalRepayment: parseNumericValue(
                getValue("principalRepayment")
              ),
              monthlyMortgagePayment: parseNumericValue(
                getValue("monthlyMortgagePayment")
              ),
              endingBalance: parseNumericValue(getValue("endingBalance")),
              paidAmount,
              paymentDate,
            };

            // Skip rows with all zero values
            if (
              entry.beginningBalance === 0 &&
              entry.endingBalance === 0 &&
              entry.monthlyInterestAmount === 0 &&
              entry.principalRepayment === 0
            ) {
              continue;
            }

            scheduleEntries.push(entry);
            lastParsedRow = i;
          }

          if (scheduleEntries.length > 0) {
            console.log(`✅ Parsed ${scheduleEntries.length} schedule entries`);
            amortizations.push({
              headerData,
              scheduleOfPayments: scheduleEntries,
            });

            // Move to next section - start from after the last row we actually parsed
            currentRow = lastParsedRow + 1;
          } else {
            console.warn(
              `⚠️ No entries found for section at row ${headerRow + 1}`
            );
            currentRow = scheduleHeaderRow + 5;
          }
        }

        if (amortizations.length === 0) {
          reject(new Error("No amortization schedules found in Excel file"));
          return;
        }

        console.log(
          `\n✅ Successfully parsed ${amortizations.length} amortization(s)`
        );
        resolve(amortizations);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to parse Excel file: " + String(error))
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
};
