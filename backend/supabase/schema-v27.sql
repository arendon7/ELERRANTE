begin;

-- EL ERRANTE V2.7 — reconciliación segura del registro de migraciones V2.3–V2.5.
-- Ejecutar DESPUÉS de schema-v26.sql en instalaciones existentes que deban actualizarse.
-- No activa Supabase ni inventa migraciones aplicadas: sólo importa evidencia legacy real.

do $$
declare
  v_legacy regclass := to_regclass('public.schema_migrations');
  v_has_version boolean := false;
  v_has_description boolean := false;
begin
  if v_legacy is not null then
    select exists(
      select 1
      from information_schema.columns
      where table_schema='public'
        and table_name='schema_migrations'
        and column_name='version'
    ) into v_has_version;

    select exists(
      select 1
      from information_schema.columns
      where table_schema='public'
        and table_name='schema_migrations'
        and column_name='description'
    ) into v_has_description;

    if v_has_version and v_has_description then
      execute $bridge$
        insert into public.app_migrations(version,label)
        select
          version::text,
          coalesce(nullif(description::text,''),'Migración legacy ' || version::text)
        from public.schema_migrations
        where version::text in ('2.3','2.4','2.5')
        on conflict(version) do nothing
      $bridge$;
    end if;
  end if;
end;
$$;

insert into public.app_migrations(version,label)
values('2.7','Reconciliación segura del registro de migraciones V2.3–V2.5')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
