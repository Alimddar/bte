'use server';
/**
 * @fileOverview An anomaly detection AI agent for financial transactions.
 *
 * - detectAnomalousTransactions - A function that handles the transaction anomaly detection process.
 * - DetectAnomalousTransactionsInput - The input type for the detectAnomalousTransactions function.
 * - DetectAnomalousTransactionsOutput - The return type for the detectAnomalousTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAnomalousTransactionsInputSchema = z.object({
  transactionData: z
    .string()
    .describe(
      'A string containing transaction details, with fields like transaction amount, user ID, timestamp, and transaction type.'
    ),
  historicalTransactionData: z
    .string()
    .describe(
      'A string containing historical transaction data for the user, with fields like transaction amount, user ID, timestamp, and transaction type.'
    ),
});
export type DetectAnomalousTransactionsInput = z.infer<
  typeof DetectAnomalousTransactionsInputSchema
>;

const DetectAnomalousTransactionsOutputSchema = z.object({
  isAnomalous: z
    .boolean()
    .describe('Whether or not the transaction is anomalous.'),
  explanation: z.string().describe('The explanation of why the transaction is anomalous.'),
  riskScore: z.number().describe('The risk score of the transaction from 0 to 1.'),
});
export type DetectAnomalousTransactionsOutput = z.infer<
  typeof DetectAnomalousTransactionsOutputSchema
>;

export async function detectAnomalousTransactions(
  input: DetectAnomalousTransactionsInput
): Promise<DetectAnomalousTransactionsOutput> {
  return detectAnomalousTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAnomalousTransactionsPrompt',
  input: {schema: DetectAnomalousTransactionsInputSchema},
  output: {schema: DetectAnomalousTransactionsOutputSchema},
  prompt: `You are an expert in fraud detection for financial transactions.

You will receive transaction data and historical transaction data for a user. Your task is to determine if the transaction is anomalous based on the historical data.

Transaction Data: {{{transactionData}}}

Historical Transaction Data: {{{historicalTransactionData}}}

Based on this information, determine if the transaction is anomalous and provide an explanation. Also, provide a risk score from 0 to 1, where 0 means not risky and 1 means highly risky.

Consider the following factors when determining if a transaction is anomalous:
- Transaction amount compared to historical transaction amounts
- Transaction timestamp compared to historical transaction timestamps
- Transaction type compared to historical transaction types
- Unusual transaction patterns
- Any other relevant factors

Return the isAnomalous boolean, explanation, and riskScore according to the schema.`,
});

const detectAnomalousTransactionsFlow = ai.defineFlow(
  {
    name: 'detectAnomalousTransactionsFlow',
    inputSchema: DetectAnomalousTransactionsInputSchema,
    outputSchema: DetectAnomalousTransactionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
