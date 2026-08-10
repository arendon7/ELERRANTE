---
type: community
cohesion: 0.38
members: 7
---

# schema-v16.sql

**Cohesion:** 0.38 - loosely connected
**Members:** 7 nodes

## Members
- [[public.inventory_movements]] - code - backend/supabase/schema-v16.sql
- [[public.orders_1]] - code - backend/supabase/schema-v16.sql
- [[public.product_operations_1]] - code - backend/supabase/schema-v16.sql
- [[public.record_inventory_movement_v16()]] - code - backend/supabase/schema-v16.sql
- [[public.sync_order_inventory_v16()]] - code - backend/supabase/schema-v16.sql
- [[schema-v16.sql]] - code - backend/supabase/schema-v16.sql
- [[trg_orders_inventory_v16]] - code - backend/supabase/schema-v16.sql

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/schema-v16sql
SORT file.name ASC
```
