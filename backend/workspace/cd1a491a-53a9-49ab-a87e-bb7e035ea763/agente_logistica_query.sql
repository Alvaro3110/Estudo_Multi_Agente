SELECT 
    l.transaction_id,
    l.transaction_date,
    l.shipment_id,
    l.shipment_date,
    l.delivery_date,
    l.status,
    l.logistic_type,
    l.warehouse_region,
    l.carrier,
    l.freight_cost,
    c.customer_id,
    c.name,
    c.segment,
    c.region,
    c.customer_profile
FROM 
    estudo_multi_agente.bronze.logistics_shipments l
JOIN 
    estudo_multi_agente.bronze.customers c ON l.customer_id = c.customer_id
WHERE 
    c.segment = 'varejo' AND c.region = 'SP';