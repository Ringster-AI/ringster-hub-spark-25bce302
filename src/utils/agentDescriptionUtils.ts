
export const generateToolInstructions = (agentData: any) => {
  const instructions: string[] = [];
  
  // Transfer directory tool instructions
  if (agentData.transfer_directory && Object.keys(agentData.transfer_directory).length > 0) {
    const departments = Object.keys(agentData.transfer_directory).join(', ');
    instructions.push(`Use the transferCall tool to transfer calls to the respective departments: ${departments}.`);
  }
  
  // Calendar booking tool instructions
  if (agentData.calendar_booking?.enabled || agentData.config?.calendar_booking?.enabled) {
    instructions.push('Use the google_calendar tool to schedule appointments when customers request to book a meeting or consultation.');
  }
  
  return instructions;
};

export const appendToolInstructionsToDescription = (description: string = '', toolInstructions: string[]) => {
  if (toolInstructions.length === 0) return description;
  
  // Remove existing tool instructions to avoid duplication
  let cleanDescription = removeExistingToolInstructions(description);
  
  // Append new tool instructions
  const instructionText = toolInstructions.join(' ');
  
  if (cleanDescription && !cleanDescription.endsWith('.')) {
    cleanDescription += '.';
  }
  
  const separator = cleanDescription ? ' ' : '';
  return `${cleanDescription}${separator}${instructionText}`;
};

const removeExistingToolInstructions = (description: string) => {
  // Remove common tool instruction patterns
  return description
    .replace(/\s*Use the transferCall tool to transfer calls to the respective departments[^.]*\./gi, '')
    .replace(/\s*Use the (calendar booking tool|google_calendar tool) to schedule appointments[^.]*\./gi, '')
    .trim();
};
