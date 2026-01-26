import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { ContractResponse, ContractStatus, ContractType } from "../types/contract.types";
import {
  EarlyPayoffRequestDto,
  useEarlyPayoffContractMutation,
} from "../api/contractApi";
import { useNotification } from "../../../shared/hooks/useNotification";

export interface EarlyPayoffDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  contract?: ContractResponse;
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const safeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const EarlyPayoffDialog: React.FC<EarlyPayoffDialogProps> = ({
  open,
  onClose,
  contractId,
  contract,
}) => {
  const { showSuccess, showError } = useNotification();
  const [earlyPayoffContract, { isLoading }] = useEarlyPayoffContractMutation();

  const [form, setForm] = useState<EarlyPayoffRequestDto>(() => ({
    payoffDate: dayjs().format("YYYY-MM-DD"),
    paymentMethod: "bank_transfer",
    transactionReference: "",
    notes: "",
  }));

  const payoffBreakdown = useMemo(() => {
    const remainingPrincipal = safeNumber(contract?.remainingPrincipalAmount);
    const remainingInterest = safeNumber(contract?.remainingInterestAmount);

    const rawPenalty =
      (contract as any)?.loanDetails?.earlyRepaymentPenalty ??
      (contract as any)?.earlyRepaymentPenalty ??
      (contract as any)?.terms?.earlyRepaymentPenalty ??
      0;

    // In this codebase, earlyRepaymentPenalty is stored as a decimal (e.g. 0.03 for 3%).
    // But if backend ever sends 3 instead of 0.03, normalize it.
    const penaltyRate =
      typeof rawPenalty === "number"
        ? rawPenalty > 1
          ? rawPenalty / 100
          : rawPenalty
        : safeNumber(rawPenalty) ?? 0;

    const hasRemainingAmounts =
      remainingPrincipal !== null && remainingInterest !== null;

    const penaltyAmount =
      remainingPrincipal !== null ? remainingPrincipal * penaltyRate : null;

    const totalPayoff =
      hasRemainingAmounts && penaltyAmount !== null
        ? remainingPrincipal! + remainingInterest! + penaltyAmount
        : null;

    return {
      remainingPrincipal,
      remainingInterest,
      penaltyRate,
      penaltyAmount,
      totalPayoff,
      hasRemainingAmounts,
    };
  }, [contract]);

  const canSubmit =
    Boolean(contract) &&
    contract?.type === ContractType.LOAN &&
    contract?.status !== ContractStatus.COMPLETED &&
    payoffBreakdown.hasRemainingAmounts &&
    Boolean(form.payoffDate) &&
    Boolean(form.paymentMethod) &&
    !isLoading;

  const handleSubmit = async () => {
    try {
      const payload: EarlyPayoffRequestDto = {
        payoffDate: form.payoffDate,
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      await earlyPayoffContract({ contractId, data: payload }).unwrap();
      showSuccess("Contract payoff submitted successfully");
      onClose();
    } catch (err: any) {
      console.error("Early payoff failed:", err);
      showError(
        err?.data?.message ||
          err?.message ||
          "Failed to payoff contract. Please try again."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>PayOff Contract</DialogTitle>
      <DialogContent>
        {contract?.type !== ContractType.LOAN && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Payoff is only available for loan contracts.
          </Alert>
        )}

        {!payoffBreakdown.hasRemainingAmounts && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Remaining principal/interest amounts are missing. Please refresh or
            check the contract financial data.
          </Alert>
        )}

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Payoff Breakdown
          </Typography>

          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Remaining principal
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(payoffBreakdown.remainingPrincipal)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Remaining interest
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(payoffBreakdown.remainingInterest)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Early repayment penalty
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(payoffBreakdown.penaltyRate * 100).toFixed(2)}%
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Penalty amount (principal × penalty)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(payoffBreakdown.penaltyAmount)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                Total payoff
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {formatCurrency(payoffBreakdown.totalPayoff)}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Payoff date"
            type="date"
            value={form.payoffDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, payoffDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            select
            label="Payment method"
            value={form.paymentMethod}
            onChange={(e) =>
              setForm((p) => ({ ...p, paymentMethod: e.target.value }))
            }
            fullWidth
          >
            <MenuItem value="bank_transfer">Bank transfer</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <TextField
            label="Transaction reference"
            value={form.transactionReference || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, transactionReference: e.target.value }))
            }
            placeholder="TXN-123456"
            fullWidth
          />

          <TextField
            label="Notes"
            value={form.notes || ""}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Customer wants to close loan early"
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isLoading ? "Submitting..." : "PayOff"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

