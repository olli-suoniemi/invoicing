-- COMPANIES
INSERT INTO companies 
    (
        name, 
        business_id, 
        email, 
        phone, 
        website, 
        created_at
    )
VALUES 
    (
        'My Company', 
        '1234567-8', 
        'demo@mycompany.fi', 
        '123-456-7890', 
        'www.mycompany.fi', 
        now()
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
        'Demo Street 1', 
        '00100', 
        'Helsinki', 
        'Uusimaa', 
        'Finland',
        now()
    ); 


-- CLIENTS
INSERT INTO clients 
    (
        type, 
        name, 
        vat_id, 
        business_id, 
        email,
        company_id, 
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
        now()
    );


-- CLIENT ADDRESSES
INSERT INTO client_addresses
    (
        client_id,
        type,
        address,
        postal_code,
        city,
        state,
        country,
        created_at
    ) VALUES 
    (
        (SELECT id FROM clients WHERE name='Demo Client Oy'),
        'invoicing',
        'Client Street 5',
        '00200',
        'Espoo',
        'Uusimaa',
        'Finland',
        now()
    );

INSERT INTO client_addresses
    (
        client_id,
        type,
        address,
        postal_code,
        city,
        state,
        country,
        created_at
    ) VALUES 
    (
        (SELECT id FROM clients WHERE name='Demo Client Oy'),
        'delivery',
        'Delivery Avenue 10',
        '01000',
        'Vantaa',
        'Uusimaa',
        'Finland',
        now()
    );