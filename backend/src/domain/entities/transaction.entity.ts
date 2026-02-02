export interface Transaction {
  id: string;
  productId: string;
  customerId: string | null;
  deliveryId: string | null;
  amount: string;
  status: string;
  wompiReference: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
