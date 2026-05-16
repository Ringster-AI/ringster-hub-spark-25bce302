ALTER POLICY "Users can insert tool call logs for their agents" ON public.tool_call_logs TO authenticated;
ALTER POLICY "Users can update their agents' tool call logs" ON public.tool_call_logs TO authenticated;
ALTER POLICY "Users can delete their agents' tool call logs" ON public.tool_call_logs TO authenticated;
ALTER POLICY "Users can view their own agents' tool call logs" ON public.tool_call_logs TO authenticated;