export type Platform = 'shopify' | 'woocommerce'
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'shipped' | 'completed' | 'cancelled'
export type ReturnOutcome = 'refund' | 'exchange' | 'store_credit'
export type MerchantPlan = 'free' | 'essential' | 'advanced' | 'enterprise'
export type PaymentMethod = 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay' | 'cash'

export interface Merchant {
  id: string
  user_id: string
  store_name: string
  store_slug: string
  platform?: Platform
  platform_store_url?: string
  platform_api_key?: string
  platform_api_secret?: string
  logo_url?: string
  primary_color: string
  plan: MerchantPlan
  created_at: string
}

export interface ReturnPolicy {
  id: string
  merchant_id: string
  return_window_days: number
  refund_enabled: boolean
  exchange_enabled: boolean
  store_credit_enabled: boolean
  exchange_bonus_vnd: number
  store_credit_bonus_vnd: number
  auto_approve: boolean
  require_photo: boolean
  allowed_reasons: string[]
  shipping_carriers: string[]
}

export interface ReturnItem {
  product_id: string
  variant_id?: string
  name: string
  sku?: string
  quantity: number
  price: number
  image_url?: string
  reason?: string
  condition?: string
}

export interface Return {
  id: string
  merchant_id: string
  return_code: string
  order_id: string
  order_number?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  status: ReturnStatus
  outcome?: ReturnOutcome
  items: ReturnItem[]
  refund_amount: number
  exchange_items: ReturnItem[]
  store_credit_amount: number
  bonus_credit: number
  payment_method?: PaymentMethod
  payment_info?: Record<string, string>
  tracking_number?: string
  shipping_carrier?: string
  photos: string[]
  notes?: string
  merchant_notes?: string
  workflow_applied: string[]
  created_at: string
  updated_at: string
}

export interface WorkflowCondition {
  field: 'order_value' | 'return_reason' | 'customer_email' | 'item_count' | 'days_since_order' | 'product_tag'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains'
  value: string | number
}

export interface WorkflowAction {
  type: 'set_exchange_bonus' | 'set_store_credit_bonus' | 'block_bonus' | 'auto_approve' | 'auto_reject' | 'set_shipping_carrier' | 'add_note' | 'extend_window'
  value?: string | number
}

export interface Workflow {
  id: string
  merchant_id: string
  name: string
  enabled: boolean
  priority: number
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  created_at: string
}

export interface StoreCredit {
  id: string
  merchant_id: string
  customer_email?: string
  customer_phone?: string
  amount: number
  used_amount: number
  return_id?: string
  expires_at?: string
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  created_at: string
  line_items: ReturnItem[]
}
