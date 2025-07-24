import { ScheduledScans } from "@/components/scheduled-scans";

export function ScheduledScansPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Automated SEO Monitoring
        </h1>
        <p className="text-gray-600">
          Set up automated daily scans to monitor your websites and get alerts when changes are detected.
        </p>
      </div>
      
      <ScheduledScans />
    </div>
  );
}