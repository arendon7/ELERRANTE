from pathlib import Path

root=Path(__file__).resolve().parents[1]
html=(root/'finanzas.html').read_text(encoding='utf-8')
js=(root/'assets/finance-usability-v351.js').read_text(encoding='utf-8')
css=(root/'assets/finance-usability-v351.css').read_text(encoding='utf-8')
test=(root/'tests/e2e/finance-usability-v351.spec.js').read_text(encoding='utf-8')

checks={
    'root_v351':'id="finance-usability-v351"' in html,
    'css_v351':'assets/finance-usability-v351.css?v=3.5.1' in html,
    'js_v351':'assets/finance-usability-v351.js?v=3.5.1' in html,
    'version':"const VERSION='3.5.1'" in js,
    'working_model':"WORKING_KEY='ee_v31_finance_working_model'" in js,
    'ledger':"MOVES_KEY='ee_v27_finance_movements'" in js,
    'traceable_correction':'EL_ERRANTE_FINANCE_V321?.applyCorrection' in js,
    'observed_cash':'EL_ERRANTE_FINANCE_V323?.recordCashCount' in js,
    'direct_plan_edit':'data-v351-plan-qty' in js,
    'direct_cost_edit':'data-v351-cost' in js,
    'direct_cash_edit':'data-v351-cash' in js,
    'direct_ledger_edit':'data-v351-save-move' in js,
    'real_sales_rule':'las ventas reales no se editan aquí' in js,
    'no_orders_write':'ee_v14_orders' not in js,
    'no_backend':'createClient' not in js and 'service_role' not in js and 'SUPABASE' not in js,
    'workbench_reachable':'#finance-workbench-v31{display:none' not in css.replace(' ',''),
    'e2e_traceability':"reversalOf===created.id" in test and "corrects===created.id" in test,
    'e2e_mobile':'overflow' in test and "Modelo avanzado" in test,
}
failed=[name for name,ok in checks.items() if not ok]
if failed:
    raise SystemExit('Finanzas V3.5.1 FAIL: '+', '.join(failed))
print('Finanzas V3.5.1 OK · mesa clara, tablas editables, caja observada y corrección trazable.')
