---
type: community
cohesion: 0.60
members: 5
---

# schema-v19.sql

**Cohesion:** 0.60 - moderately connected
**Members:** 5 nodes

## Members
- [[public.lookup_order_status_v19()]] - code - backend/supabase/schema-v19.sql
- [[public.order_status_events]] - code - backend/supabase/schema-v19.sql
- [[public.record_order_status_event_v19()]] - code - backend/supabase/schema-v19.sql
- [[schema-v19.sql]] - code - backend/supabase/schema-v19.sql
- [[trg_order_status_event_v19]] - code - backend/supabase/schema-v19.sql

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/schema-v19sql
SORT file.name ASC
```
