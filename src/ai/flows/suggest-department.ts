'use server';
/**
 * @fileOverview This file defines a Genkit flow to suggest the most relevant department for an issue based on the description and image.
 *
 * @exports suggestDepartment - An async function that takes issue details and returns a suggested department.
 * @exports SuggestDepartmentInput - The input type for the suggestDepartment function.
 * @exports SuggestDepartmentOutput - The output type for the suggestDepartment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDepartmentInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the issue reported by the employee.'),
  image: z
    .string()
    .describe(
      "A photo related to the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestDepartmentInput = z.infer<typeof SuggestDepartmentInputSchema>;

const SuggestDepartmentOutputSchema = z.object({
  suggestedDepartment: z
    .string()
    .describe('The AI-suggested department for the reported issue.'),
});
export type SuggestDepartmentOutput = z.infer<typeof SuggestDepartmentOutputSchema>;

export async function suggestDepartment(input: SuggestDepartmentInput): Promise<SuggestDepartmentOutput> {
  return suggestDepartmentFlow(input);
}

const suggestDepartmentPrompt = ai.definePrompt({
  name: 'suggestDepartmentPrompt',
  input: {schema: SuggestDepartmentInputSchema},
  output: {schema: SuggestDepartmentOutputSchema},
  prompt: `You are an AI assistant helping to categorize employee issue reports to the correct department.

  Based on the employee's description and the attached image, determine the most relevant department for the issue.
  Available departments are: IT, HR, Facilities, Maintenance, Operations, Finance, and Legal.

  Description: {{{description}}}
  Image: {{media url=image}}

  Suggest the single most relevant department for this issue.  It is vital that you choose only one.
  Return ONLY the department name, nothing else.`,
});

const suggestDepartmentFlow = ai.defineFlow(
  {
    name: 'suggestDepartmentFlow',
    inputSchema: SuggestDepartmentInputSchema,
    outputSchema: SuggestDepartmentOutputSchema,
  },
  async input => {
    const {output} = await suggestDepartmentPrompt(input);
    return output!;
  }
);
