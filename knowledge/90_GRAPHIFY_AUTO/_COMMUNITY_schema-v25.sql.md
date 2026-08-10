---
type: community
cohesion: 0.40
members: 6
---

# schema-v25.sql

**Cohesion:** 0.40 - moderately connected
**Members:** 6 nodes

## Members
- [[public.material_purchase_orders_v25]] - code - backend/supabase/schema-v25.sql
- [[public.material_purchase_receipts_v25]] - code - backend/supabase/schema-v25.sql
- [[public.receive_material_purchase_order_v25()]] - code - backend/supabase/schema-v25.sql
- [[public.transition_material_purchase_order_v25()]] - code - backend/supabase/schema-v25.sql
- [[schema-v25.sql]] - code - backend/supabase/schema-v25.sql
- [[trg_material_purchase_orders_v25_updated_at]] - code - backend/supabase/schema-v25.sql

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/schema-v25sql
SORT file.name ASC
```
