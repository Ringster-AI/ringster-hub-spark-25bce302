
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { billingService } from "@/services/billingService";

export const useBillingData = () => {
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoadingBilling(true);
        const data = await billingService.getDetailedUsageData();
        setBillingData(data);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load billing data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBilling(false);
      }
    };

    fetchBillingData();
  }, [toast]);

  return { billingData, isLoadingBilling };
};
