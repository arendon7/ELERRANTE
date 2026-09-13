begin;

-- EL ERRANTE V2.8 — endurecimiento de RPC SECURITY DEFINER frente al rol anon.
-- Supabase puede asignar EXECUTE explícito a anon/authenticated al crear funciones.
-- REVOKE FROM PUBLIC no elimina esos grants explícitos, por lo que aquí cerramos
-- el acceso anónimo a las funciones administrativas y de trigger.
--
-- Se conservan intencionalmente ejecutables por anon:
--   - public.is_admin(): utilizada por políticas RLS y devuelve false sin sesión admin.
--   - public.lookup_order_status_v19(text,text): consulta pública limitada por referencia+correo.

revoke execute on function public.activation_health_v20() from anon;
revoke execute on function public.record_admin_event(text,text,text,jsonb) from anon;
revoke execute on function public.record_inventory_movement_v16(text,text,numeric,numeric,text) from anon;
revoke execute on function public.record_order_status_event_v19() from anon;
revoke execute on function public.save_order_fulfillment_v22(text,boolean,boolean,boolean,boolean,text) from anon;
revoke execute on function public.set_admin_user_v20(text,text,boolean) from anon;
revoke execute on function public.sync_order_inventory_v16() from anon;
revoke execute on function public.transition_order_v21(text,text,text) from anon;
revoke execute on function public.transition_order_v22(text,text,text) from anon;

insert into public.app_migrations(version,label)
values('2.8','Endurecimiento de EXECUTE anon para RPC administrativas SECURITY DEFINER')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
