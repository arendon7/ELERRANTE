---
type: community
cohesion: 0.39
members: 8
---

# schema-v15.sql

**Cohesion:** 0.39 - loosely connected
**Members:** 8 nodes

## Members
- [[public.admin_audit_log]] - code - backend/supabase/schema-v15.sql
- [[public.record_admin_event()]] - code - backend/supabase/schema-v15.sql
- [[public.set_updated_at()]] - code - backend/supabase/schema-v15.sql
- [[schema-v15.sql]] - code - backend/supabase/schema-v15.sql
- [[trg_fixed_costs_updated_at]] - code - backend/supabase/schema-v15.sql
- [[trg_orders_updated_at]] - code - backend/supabase/schema-v15.sql
- [[trg_product_operations_updated_at]] - code - backend/supabase/schema-v15.sql
- [[trg_public_settings_updated_at]] - code - backend/supabase/schema-v15.sql

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/schema-v15sql
SORT file.name ASC
```
