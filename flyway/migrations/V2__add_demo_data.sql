-- COMPANIES
INSERT INTO companies 
    (
        name, 
        business_id, 
        email, 
        phone, 
        website, 
        created_at,
        iban,
        logo_path
    )
VALUES 
    (
        'My Company', 
        '1234567-8', 
        'demo@mycompany.fi', 
        '123-456-7890', 
        'www.mycompany.fi', 
        now(),
        'FI2112345600000785',
        '/apples.png'
    );


-- COMPANY ADDRESSES
INSERT INTO company_addresses 
    (
        company_id, 
        type, 
        address, 
        postal_code, 
        city, 
        state, 
        country, 
        created_at
    )
VALUES 
    (
        (SELECT id FROM companies WHERE name='My Company'), 
        'invoicing', 
        'Invoicing Street 1', 
        '00100', 
        'Helsinki', 
        'Uusimaa', 
        'Finland',
        now()
    ); 

INSERT INTO company_addresses 
    (
        company_id, 
        type, 
        address, 
        postal_code, 
        city, 
        state, 
        country, 
        created_at
    )
VALUES 
    (
        (SELECT id FROM companies WHERE name='My Company'), 
        'delivery', 
        'Delivery Street 1', 
        '00100', 
        'Helsinki', 
        'Uusimaa', 
        'Finland',
        now()
    ); 


-- customers
INSERT INTO customers 
    (
        type, 
        name, 
        vat_id, 
        business_id, 
        email,
        company_id,
        internal_info,
        created_at
    )
VALUES 
    (
        'business', 
        'Demo Client Oy', 
        'FI12345678', 
        '7654321-0', 
        'demo@democlient.fi', 
        (SELECT id FROM companies WHERE name='My Company'),
        'Some internal info about Demo Client Oy',
        now()
    );

INSERT INTO customers 
    (
        type, 
        name,
        email,
        phone,
        company_id, 
        created_at,
        internal_info
    )
VALUES 
    (
        'individual', 
        'Demo Person', 
        'demo@demoperson.fi', 
        '123-456-7890',
        (SELECT id FROM companies WHERE name='My Company'),
        now(),
        'Some internal info about Demo Person'
    );


-- CUSTOMER ADDRESSES
INSERT INTO customer_addresses
    (
        customer_id,
        type,
        address,
        postal_code,
        city,
        state,
        country,
        created_at,
        extra_info
    ) VALUES 
    (
        (SELECT id FROM customers WHERE name='Demo Client Oy'),
        'invoicing',
        'Client Street 5',
        '00200',
        'Espoo',
        'Uusimaa',
        'Finland',
        now(),
        'Some extra info about the invoicing address'
    );

INSERT INTO customer_addresses
    (
        customer_id,
        type,
        address,
        postal_code,
        city,
        state,
        country,
        created_at,
        extra_info
    ) VALUES 
    (
        (SELECT id FROM customers WHERE name='Demo Client Oy'),
        'delivery',
        'Delivery Avenue 10',
        '01000',
        'Vantaa',
        'Uusimaa',
        'Finland',
        now(),
        'Some extra info about the delivery address'
    );

INSERT INTO customer_addresses
    (
        customer_id,
        type,
        address,
        postal_code,
        city,
        state,
        country,
        created_at,
        extra_info
    ) VALUES 
    (
        (SELECT id FROM customers WHERE name='Demo Person'),
        'invoicing',
        'Person Road 3',
        '00300',
        'Helsinki',
        'Uusimaa',
        'Finland',
        now(),
        'Some extra info about Demo Person''s address'
    );

-- products
INSERT INTO products 
    (
        name, 
        ean_code, 
        description, 
        unit_price_vat_excl, 
        unit_price_vat_incl, 
        tax_rate, 
        company_id, 
        created_at
    )
VALUES 
    (
        'Demo Product 1', 
        '6412345000012', 
        'Very good product.', 
        10.00, 
        12.40, 
        24.00, 
        (SELECT id FROM companies WHERE name='My Company'),
        now()
    );

INSERT INTO products 
    (
        name, 
        ean_code, 
        description, 
        unit_price_vat_excl, 
        unit_price_vat_incl, 
        tax_rate, 
        company_id, 
        created_at
    )
VALUES 
    (
        'Demo Product 2', 
        '6412345000029', 
        'Another very good product.', 
        20.00, 
        24.80, 
        24.00, 
        (SELECT id FROM companies WHERE name='My Company'),
        now()
    );

-- orders
INSERT INTO orders
    (
        customer_id, 
        company_id, 
        order_date, 
        total_amount_vat_excl, 
        total_amount_vat_incl, 
        status, 
        created_at
    )
VALUES 
    (
        (SELECT id FROM customers WHERE name='Demo Client Oy'), 
        (SELECT id FROM companies WHERE name='My Company'), 
        current_date, 
        30.00, 
        37.20, 
        'pending',
        now()
    );

-- order items
INSERT INTO order_items
    (
        order_id, 
        product_id, 
        quantity,
        unit_price_vat_excl, 
        unit_price_vat_incl, 
        total_price_vat_excl, 
        total_price_vat_incl, 
        created_at
    )
VALUES 
    (
        (SELECT id FROM orders WHERE order_number = (SELECT order_number FROM orders LIMIT 1)), 
        (SELECT id FROM products WHERE name='Demo Product 1'), 
        1,
        10.00, 
        12.40, 
        10.00, 
        12.40, 
        now()
    );

INSERT INTO order_items
    (
        order_id, 
        product_id, 
        quantity,
        unit_price_vat_excl, 
        unit_price_vat_incl, 
        total_price_vat_excl, 
        total_price_vat_incl, 
        created_at,
        tax_rate
    )
VALUES 
    (
        (SELECT id FROM orders WHERE order_number = (SELECT order_number FROM orders LIMIT 1)), 
        (SELECT id FROM products WHERE name='Demo Product 2'), 
        1,
        20.00, 
        24.80, 
        20.00, 
        24.80, 
        now(),
        24.00
    );