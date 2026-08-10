---
source_file: "backend/supabase/schema-v14.sql"
type: "code"
community: "schema-v14.sql"
location: "L26"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/schema-v14sql
---

# public.orders

## Connections
- [[public.order_items]] - `references` [EXTRACTED]
- [[public.payment_receipts]] - `references` [EXTRACTED]
- [[schema-v14.sql]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/schema-v14sql