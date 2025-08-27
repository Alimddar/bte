'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CreditCard, Save, Smartphone, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  provider: string;
  type: string;
  status: string;
  accountNumber?: string;
  expiryDate?: string;
  qrCode?: string;
  credentials: any;
  minAmount: number;
  maxAmount: number;
  commission: number;
  currency: string;
}

interface CardsClientProps {
  initialCards: PaymentMethod[];
  onUpdate?: (id: string, updateData: any) => Promise<{ success: boolean; error?: string }>;
}

export function CardsClient({ initialCards, onUpdate }: CardsClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-6 h-6" />;
      case 'wallet': return <Wallet className="w-6 h-6" />;
      case 'card': return <CreditCard className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mobile': return 'Mobile Payment';
      case 'wallet': return 'E-Wallet';
      case 'card': return 'Card Payment';
      default: return 'Payment Method';
    }
  };

  const handleSave = async (method: PaymentMethod, formData: any) => {
    if (!onUpdate) return;
    
    setIsSubmitting(true);
    try {
      const result = await onUpdate(method.id, formData);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: `${method.provider} credentials have been updated.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update payment method.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <p className="text-muted-foreground">
          Update payment method credentials and settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {initialCards.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            getIcon={getIcon}
            getTypeLabel={getTypeLabel}
          />
        ))}
      </div>
    </div>
  );
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSave: (method: PaymentMethod, formData: any) => void;
  isSubmitting: boolean;
  getIcon: (type: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
}

function PaymentMethodCard({ method, onSave, isSubmitting, getIcon, getTypeLabel }: PaymentMethodCardProps) {
  const formSchema = z.object({
    provider: z.string().min(1, 'Provider name is required'),
    accountNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    qrCode: z.string().url().optional().or(z.literal('')),
    minAmount: z.number().min(0, 'Min amount must be positive'),
    maxAmount: z.number().min(1, 'Max amount must be greater than 0'),
    commission: z.number().min(0, 'Commission must be non-negative'),
    currency: z.string().min(1, 'Currency is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: method.provider || '',
      accountNumber: method.accountNumber || '',
      expiryDate: method.expiryDate || '',
      qrCode: method.qrCode || '',
      minAmount: method.minAmount || 0,
      maxAmount: method.maxAmount || 1000,
      commission: method.commission || 0,
      currency: method.currency || 'AZN',
    },
  });

  const onSubmit = (data: FormValues) => {
    onSave(method, data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {getIcon(method.type)}
          <div>
            <CardTitle>{method.provider}</CardTitle>
            <CardDescription>{getTypeLabel(method.type)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Provider name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(method.type === 'card' || method.type === 'mobile') && (
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {method.type === 'card' ? 'Card Number' : 'Account Number'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={method.type === 'card' ? '4286521613334444' : '901234567890'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {method.type === 'card' && (
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input placeholder="12/25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {method.type === 'mobile' && (
                <FormField
                  control={form.control}
                  name="qrCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QR Code URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.qrserver.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AZN">AZN</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
