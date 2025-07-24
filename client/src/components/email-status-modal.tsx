import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Clock, Copy, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailResult: any;
}

export function EmailStatusModal({ isOpen, onClose, emailResult }: EmailStatusModalProps) {
  const { toast } = useToast();

  if (!emailResult) return null;

  const copyEmailContent = () => {
    navigator.clipboard.writeText(emailResult.emailPreview?.body || '');
    toast({
      title: "Copied",
      description: "Email content copied to clipboard",
    });
  };

  const exportMutation = useMutation({
    mutationFn: async ({ format }: { format: 'pdf' | 'csv' }) => {
      const exportData = {
        format,
        userEmail: emailResult.emailPreview?.to,
        url: emailResult.analysisId,
        emailContent: emailResult.emailPreview,
        auditResult: emailResult.audit
      };

      const response = await fetch('/api/export/email-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-audit-report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Export Complete",
        description: `Email audit report downloaded as ${variables.format.toUpperCase()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Email Sent Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Delivery Status */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Delivery Confirmation</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Recipient:</span>
                <div className="font-medium">{emailResult.deliveryStatus?.recipient}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {emailResult.deliveryStatus?.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Message ID:</span>
                <div className="font-mono text-xs">{emailResult.deliveryStatus?.messageId}</div>
              </div>
              <div>
                <span className="text-gray-600">Sent At:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(emailResult.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Email Audit Results */}
          {emailResult.audit && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Email Quality Audit</span>
                <Badge className="bg-blue-100 text-blue-800">
                  Score: {emailResult.audit.score}/100
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-600">Subject Length:</span>
                  <div className="font-medium">{emailResult.audit.contentAnalysis.subjectLength} chars</div>
                </div>
                <div>
                  <span className="text-gray-600">Spam Risk:</span>
                  <div className="font-medium">{emailResult.audit.contentAnalysis.spamScore}/100</div>
                </div>
                <div>
                  <span className="text-gray-600">Readability:</span>
                  <div className="font-medium">{emailResult.audit.contentAnalysis.readabilityScore}/100</div>
                </div>
              </div>

              {emailResult.audit.issues.length > 0 && (
                <div className="mb-2">
                  <span className="text-red-600 font-medium text-xs">Issues:</span>
                  <ul className="text-xs text-red-700 ml-4">
                    {emailResult.audit.issues.map((issue: string, idx: number) => (
                      <li key={idx}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {emailResult.audit.warnings.length > 0 && (
                <div className="mb-2">
                  <span className="text-orange-600 font-medium text-xs">Warnings:</span>
                  <ul className="text-xs text-orange-700 ml-4">
                    {emailResult.audit.warnings.map((warning: string, idx: number) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {emailResult.audit.suggestions.length > 0 && (
                <div>
                  <span className="text-blue-600 font-medium text-xs">Suggestions:</span>
                  <ul className="text-xs text-blue-700 ml-4">
                    {emailResult.audit.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Email Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">Email Content</span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyEmailContent}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">To:</span>
                <span className="ml-2 font-medium">{emailResult.emailPreview?.to}</span>
              </div>
              <div>
                <span className="text-gray-600">Subject:</span>
                <span className="ml-2 font-medium">{emailResult.emailPreview?.subject}</span>
              </div>
              <div>
                <span className="text-gray-600">Body:</span>
                <pre className="mt-2 p-3 bg-white rounded border text-xs whitespace-pre-wrap">
                  {emailResult.emailPreview?.body}
                </pre>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          {emailResult.audit && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-900">Export Audit Report</span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportMutation.mutate({ format: 'pdf' })}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  {exportMutation.isPending && exportMutation.variables?.format === 'pdf' ? 'Generating...' : 'Download PDF'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportMutation.mutate({ format: 'csv' })}
                  disabled={exportMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  {exportMutation.isPending && exportMutation.variables?.format === 'csv' ? 'Generating...' : 'Download CSV'}
                </Button>
              </div>
              
              <p className="text-xs text-amber-700 mt-2">
                Export detailed audit reports for documentation, compliance, or further analysis.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}