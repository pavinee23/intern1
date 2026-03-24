-- Add missing fields to acc_purchase_orders table for VAT purchase tracking
-- Created: 2026-03-24

-- Add tax_invoice_date field
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS tax_invoice_date DATE NULL COMMENT 'วันที่ในใบกำกับภาษี'
AFTER doc_date;

-- Add payment_type field
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS payment_type ENUM('cash','credit') DEFAULT 'credit' COMMENT 'ประเภทการชำระเงิน'
AFTER supplier_id;

-- Add branch_code field for suppliers
ALTER TABLE acc_suppliers
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20) NULL COMMENT 'รหัสสาขา'
AFTER tax_id;

-- Add supplier_name field to acc_suppliers (for compatibility)
ALTER TABLE acc_suppliers
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255) NULL COMMENT 'ชื่อผู้จำหน่าย (compat)'
AFTER name_en;

-- Update status ENUM to include all needed statuses
ALTER TABLE acc_purchase_orders
MODIFY COLUMN status ENUM('draft','approved','confirmed','received','paid','completed','cancelled') DEFAULT 'draft';
