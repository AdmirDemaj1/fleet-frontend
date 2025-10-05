import { ApprovalWorkflowResult } from "../types/auth.types";

// Notification types (you can customize these based on your notification system)
export interface NotificationOptions {
  approvalId?: string;
  duration?: number;
  [key: string]: any;
}

/**
 * Handles approval workflow results and shows appropriate notifications
 */
export class ApprovalHandler {
  /**
   * Show info notification (for approval pending)
   */
  static showInfo = (message: string, options: NotificationOptions = {}) => {
    console.info("📋 Info:", message, options);
    // TODO: Replace with your actual notification system
    // For example: toast.info(message, options);
    alert(
      `ℹ️ ${message}${options.approvalId ? ` (ID: ${options.approvalId})` : ""}`
    );
  };

  /**
   * Show success notification (for immediate completion)
   */
  static showSuccess = (message: string, options: NotificationOptions = {}) => {
    console.log("✅ Success:", message, options);
    // TODO: Replace with your actual notification system
    // For example: toast.success(message, options);
    alert(`✅ ${message}`);
  };

  /**
   * Show error notification
   */
  static showError = (message: string, options: NotificationOptions = {}) => {
    console.error("❌ Error:", message, options);
    // TODO: Replace with your actual notification system
    // For example: toast.error(message, options);
    alert(`❌ ${message}`);
  };

  /**
   * Handle approval workflow result with automatic notification
   */
  static handleApprovalResult<T>(
    result: ApprovalWorkflowResult<T>,
    config: {
      pendingMessage?: string;
      successMessage?: (data: T) => string;
      entityName?: string;
    }
  ): void {
    if (result.requiresApproval) {
      // Low-tier user - show approval pending
      const message = config.pendingMessage || `Request submitted for approval`;
      this.showInfo(message, {
        approvalId: result.approvalRequestId,
      });
    } else if (result.data) {
      // Admin user - show success
      let message = "Action completed successfully";

      if (config.successMessage) {
        message = config.successMessage(result.data);
      } else if (config.entityName && result.data && (result.data as any)?.firstName) {
        message = `${config.entityName} ${(result.data as any).firstName} created successfully!`;
      }

      this.showSuccess(message);
    } else {
      this.showError("Unexpected response format");
    }
  }

  /**
   * Handle customer creation result (example usage)
   */
  static handleCustomerCreation(result: ApprovalWorkflowResult<any>): void {
    this.handleApprovalResult(result, {
      pendingMessage: "Customer creation request submitted for approval",
      successMessage: (data) =>
        `Customer ${(data as any)?.firstName || "Unknown"} created successfully!`,
      entityName: "Customer",
    });
  }

  /**
   * Handle generic RBAC test result
   */
  static handleRbacTest(result: ApprovalWorkflowResult<any>): void {
    this.handleApprovalResult(result, {
      pendingMessage: "RBAC test request submitted for approval",
      successMessage: (data) =>
        `RBAC test completed: ${data.message || "Success"}`,
      entityName: "Test",
    });
  }
}

/**
 * Utility functions for approval workflow
 */
export const approvalUtils = {
  /**
   * Check if result requires approval
   */
  requiresApproval: (result: ApprovalWorkflowResult<any>): boolean => {
    return result.requiresApproval === true;
  },

  /**
   * Get approval request ID from result
   */
  getApprovalId: (result: ApprovalWorkflowResult<any>): string | null => {
    return result.approvalRequestId || null;
  },

  /**
   * Check if result has data (immediate completion)
   */
  hasData: (result: ApprovalWorkflowResult<any>): boolean => {
    return !!result.data;
  },

  /**
   * Extract data from result
   */
  getData: <T>(result: ApprovalWorkflowResult<T>): T | null => {
    return result.data || null;
  },

  /**
   * Format approval status for display
   */
  formatStatus: (result: ApprovalWorkflowResult<any>): string => {
    if (result.requiresApproval) {
      return `Pending Approval (ID: ${result.approvalRequestId})`;
    }
    return "Completed";
  },
};
