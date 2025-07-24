import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";
import { urlAnalysisSchema, type UrlAnalysis, type SEOAnalysisResult } from "@shared/schema";

interface SEOAnalysisFormProps {
  onAnalysisComplete: (result: SEOAnalysisResult) => void;
}

export function SEOAnalysisForm({ onAnalysisComplete }: SEOAnalysisFormProps) {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<UrlAnalysis>({
    resolver: zodResolver(urlAnalysisSchema),
    defaultValues: {
      url: "",
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async (data: UrlAnalysis) => {
      setProgress(5);
      
      // Progressive progress simulation for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 800);
      
      try {
        const response = await apiRequest("POST", "/api/analyze", data);
        const result = await response.json();
        
        clearInterval(progressInterval);
        setProgress(95);
        
        if (!result.success) {
          throw new Error(result.error || "Analysis failed");
        }
        
        return result.data as SEOAnalysisResult;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (result) => {
      setProgress(100);
      toast({
        title: "Analysis Complete",
        description: `SEO analysis completed for ${result.url}`,
      });
      onAnalysisComplete(result);
      setTimeout(() => setProgress(0), 1000);
    },
    onError: (error) => {
      setProgress(0);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UrlAnalysis) => {
    setProgress(5);
    analysisMutation.mutate(data);
  };

  return (
    <Card className="shadow-lg border border-gray-200 mb-8">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive SEO Analysis</h2>
          <p className="text-gray-600">Enter a URL to perform deep SEO analysis and get actionable insights</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-3">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          className="text-lg py-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={analysisMutation.isPending}
                  className="px-8 py-3 font-semibold"
                >
                  <Search className="mr-2" size={20} />
                  {analysisMutation.isPending ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Enhanced Progress Bar */}
          {analysisMutation.isPending && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {progress < 10 ? "Initializing analysis..." :
                   progress < 25 ? "Fetching website content..." :
                   progress < 40 ? "Analyzing meta tags and performance..." :
                   progress < 55 ? "Checking schema markup and accessibility..." :
                   progress < 70 ? "Testing links and social media tags..." :
                   progress < 85 ? "Analyzing robots.txt and breadcrumbs..." :
                   "Generating comprehensive report..."}
                </span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 mb-3" />
              
              {/* Analysis Steps Checklist */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { step: "Content", threshold: 25 },
                  { step: "Meta Tags", threshold: 40 },
                  { step: "Schema", threshold: 55 },
                  { step: "Links", threshold: 70 },
                  { step: "Performance", threshold: 85 },
                  { step: "Social Media", threshold: 95 },
                  { step: "Report", threshold: 100 }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center ${progress >= item.threshold ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${progress >= item.threshold ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    {item.step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
