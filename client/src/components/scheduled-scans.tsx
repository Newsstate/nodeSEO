import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Trash2, AlertCircle, Mail, Calendar, Send, CheckCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { EmailStatusModal } from "./email-status-modal";
import type { ScheduledScan, ScanAlert } from "@shared/schema";

export function ScheduledScans() {
  const [showForm, setShowForm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    url: "",
    userEmail: "kapil.sharma6294@gmail.com", // Pre-fill with default email
    frequency: "daily" as "daily" | "weekly" | "monthly" | "custom",
    customTime: "09:00",
    customDays: [] as number[],
    timeZone: "UTC",
  });
  const { toast } = useToast();

  // Get all scheduled scans for all users (for demo purposes)
  const defaultEmail = "kapil.sharma6294@gmail.com"; // Use the actual email from the scans

  const { data: scans = [], isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scheduled-scans", defaultEmail],
    queryFn: async () => {
      const response = await fetch(`/api/scheduled-scans?userEmail=${encodeURIComponent(defaultEmail)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled scans');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/scan-alerts", defaultEmail],
    queryFn: async () => {
      const response = await fetch(`/api/scan-alerts?userEmail=${encodeURIComponent(defaultEmail)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scan alerts');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const createScanMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Creating scheduled scan with data:", data);
      const response = await apiRequest("POST", "/api/scheduled-scans", data);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Scan created successfully:", result);
      toast({
        title: "Scheduled scan created",
        description: "Your website will be monitored according to the schedule.",
      });
      setShowForm(false);
      setFormData({ 
        url: "", 
        userEmail: "kapil.sharma6294@gmail.com", 
        frequency: "daily",
        customTime: "09:00",
        customDays: [],
        timeZone: "UTC"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-scans"] });
    },
    onError: (error: any) => {
      console.error("Error creating scheduled scan:", error);
      toast({
        title: "Scheduling Error",
        description: error.message || "Failed to create scheduled scan. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteScanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/scheduled-scans/${id}?userEmail=${encodeURIComponent(defaultEmail)}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scheduled scan deleted",
        description: "The scan has been removed from your monitoring list.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-scans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete scheduled scan",
        variant: "destructive",
      });
    },
  });

  const markAlertReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("POST", `/api/scan-alerts/${alertId}/read?userEmail=${encodeURIComponent(defaultEmail)}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scan-alerts"] });
    },
  });

  const sendInstantEmailMutation = useMutation({
    mutationFn: async (data: { userEmail: string; url: string }) => {
      console.log("Sending instant email for:", data);
      const response = await apiRequest("POST", "/api/send-test-email", data);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Email sent successfully:", result);
      
      // Store result and show modal
      setEmailResult(result);
      setShowEmailModal(true);
      
      // Show brief success notification
      toast({
        title: "✅ Email Sent Successfully!",
        description: `SEO analysis sent to ${result.emailPreview?.to}`,
      });
      
      // Log delivery confirmation
      if (result.deliveryStatus) {
        console.log("📧 Email delivery confirmed:", {
          messageId: result.deliveryStatus.messageId,
          recipient: result.deliveryStatus.recipient,
          status: result.deliveryStatus.status,
          timestamp: result.deliveryStatus.timestamp
        });
      }
    },
    onError: (error: any) => {
      console.error("Error sending email:", error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email notification",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    try {
      // Check URL format
      new URL(formData.url);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.url || !formData.userEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting scheduled scan:", formData);
    createScanMutation.mutate(formData);
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return 'Custom';
      default:
        return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Recent Alerts ({unreadAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(alert.severity)} variant="outline">
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium">{alert.changeType.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600">{alert.url}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAlertReadMutation.mutate(alert.id)}
                  >
                    Mark Read
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Scheduled Scans
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Scan
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email for Alerts</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.userEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">Scan Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, frequency: value as "daily" | "weekly" | "monthly" | "custom" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom scheduling options */}
                {formData.frequency === "custom" && (
                  <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                    <div>
                      <Label htmlFor="customTime">Time</Label>
                      <Input
                        id="customTime"
                        type="time"
                        value={formData.customTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, customTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select value={formData.timeZone} onValueChange={(value) => setFormData(prev => ({ ...prev, timeZone: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          <SelectItem value="Asia/Kolkata">India</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-full">
                      <Label>Days of Week</Label>
                      <div className="flex gap-2 mt-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Button
                            key={day}
                            type="button"
                            size="sm"
                            variant={formData.customDays.includes(index) ? "default" : "outline"}
                            onClick={() => {
                              const days = formData.customDays.includes(index)
                                ? formData.customDays.filter(d => d !== index)
                                : [...formData.customDays, index];
                              setFormData(prev => ({ ...prev, customDays: days }));
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={createScanMutation.isPending}>
                  {createScanMutation.isPending ? "Creating..." : "Create Scheduled Scan"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {scansLoading ? (
            <div className="text-center py-8">Loading scheduled scans...</div>
          ) : scans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No scheduled scans yet</p>
              <p className="text-sm">Add a website to start automated monitoring</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{scan.url}</span>
                      <Badge variant="outline">
                        {getFrequencyLabel(scan.frequency)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {scan.userEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Next: {new Date(scan.nextScan).toLocaleDateString()}
                      </div>
                      {scan.lastScan && (
                        <div className="text-xs">
                          Last: {new Date(scan.lastScan).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendInstantEmailMutation.mutate({ 
                        userEmail: scan.userEmail, 
                        url: scan.url 
                      })}
                      disabled={sendInstantEmailMutation.isPending}
                      className="text-blue-600 hover:text-blue-700"
                      title="Send instant email notification"
                    >
                      {sendInstantEmailMutation.isPending ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteScanMutation.mutate(scan.id)}
                      disabled={deleteScanMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Status Modal */}
      <EmailStatusModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailResult={emailResult}
      />
    </div>
  );
}