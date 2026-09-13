begin;

-- EL ERRANTE V2.8 — endurecimiento de RPC SECURITY DEFINER frente al rol anon.
-- Supabase puede asignar EXECUTE explícito a PUBLIC, anon y authenticated al crear funciones.
-- Un REVOKE únicamente sobre PUBLIC no elimina grants explícitos de anon; de forma inversa,
-- revocar sólo anon no elimina un grant heredado de PUBLIC. Por eso las funciones
-- administrativas y de trigger se cierran frente a ambos.
--
-- Se conservan intencionalmente ejecutables por anon:
--   - public.is_admin(): utilizada por políticas RLS y devuelve false sin sesión admin.
--   - public.lookup_order_status_v19(text,text): consulta pública limitada por referencia+correo.

revoke execute on function public.activation_health_v20() from public, anon;
revoke execute on function public.record_admin_event(text,text,text,jsonb) from public, anon;
revoke execute on function public.record_inventory_movement_v16(text,text,numeric,numeric,text) from public, anon;
revoke execute on function public.record_order_status_event_v19() from public, anon;
revoke execute on function public.save_order_fulfillment_v22(text,boolean,boolean,boolean,boolean,text) from public, anon;
revoke execute on function public.set_admin_user_v20(text,text,boolean) from public, anon;
revoke execute on function public.sync_order_inventory_v16() from public, anon;
revoke execute on function public.transition_order_v21(text,text,text) from public, anon;
revoke execute on function public.transition_order_v22(text,text,text) from public, anon;

insert into public.app_migrations(version,label)
values('2.8','Endurecimiento de EXECUTE anon/PUBLIC para RPC administrativas SECURITY DEFINER')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
