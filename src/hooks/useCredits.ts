import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditsService } from "@/services/creditsService";
import { CreditStatus } from "@/types/credits";

export const useCredits = () => {
  const queryClient = useQueryClient();

  const { data: creditStatus, isLoading, error } = useQuery({
    queryKey: ["credits"],
    queryFn: () => CreditsService.getCreditStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const deductCredits = async (creditsAmount: number, description?: string, callLogId?: string) => {
    const success = await CreditsService.deductCredits(creditsAmount, description, callLogId);
    if (success) {
      // Invalidate and refetch credits data
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    }
    return success;
  };

  const addCredits = async (creditsAmount: number, creditType: 'plan' | 'add_on' = 'add_on', description?: string) => {
    const success = await CreditsService.addCredits(creditsAmount, creditType, description);
    if (success) {
      // Invalidate and refetch credits data
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    }
    return success;
  };

  const hasEnoughCredits = (creditsRequired: number): boolean => {
    return creditStatus ? creditStatus.remainingCredits >= creditsRequired : false;
  };

  return {
    creditStatus: creditStatus as CreditStatus | null,
    isLoading,
    error,
    deductCredits,
    addCredits,
    hasEnoughCredits,
    refreshCredits: () => queryClient.invalidateQueries({ queryKey: ["credits"] }),
  };
};