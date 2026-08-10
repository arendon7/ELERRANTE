---
type: community
cohesion: 0.31
members: 9
---

# schema-v14.sql

**Cohesion:** 0.31 - loosely connected
**Members:** 9 nodes

## Members
- [[public.admin_users]] - code - backend/supabase/schema-v14.sql
- [[public.fixed_costs]] - code - backend/supabase/schema-v14.sql
- [[public.is_admin()]] - code - backend/supabase/schema-v14.sql
- [[public.order_items]] - code - backend/supabase/schema-v14.sql
- [[public.orders]] - code - backend/supabase/schema-v14.sql
- [[public.payment_receipts]] - code - backend/supabase/schema-v14.sql
- [[public.product_operations]] - code - backend/supabase/schema-v14.sql
- [[public.public_settings]] - code - backend/supabase/schema-v14.sql
- [[schema-v14.sql]] - code - backend/supabase/schema-v14.sql

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/schema-v14sql
SORT file.name ASC
```
