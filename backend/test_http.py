import requests

# Login primero
login_url = 'http://localhost:8000/api/auth/login/'
login_data = {
    'cedula': '1234567890',  # Usuario operario de prueba
    'password': 'password123'
}

print("=== INTENTANDO LOGIN ===")
try:
    response = requests.post(login_url, json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code != 200:
        # Intentar con otro usuario
        login_data['cedula'] = '123456789'
        response = requests.post(login_url, json=login_data)
        print(f"Segundo intento - Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token') or data.get('access')
        print(f"✅ Login exitoso, token: {token[:20]}...")
        
        headers = {'Authorization': f'Token {token}'}
        
        # Test endpoints
        print("\n=== TEST /api/reportes/ ===")
        r = requests.get('http://localhost:8000/api/reportes/', headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            reportes = r.json()
            print(f"Cantidad: {len(reportes) if isinstance(reportes, list) else 'No es lista'}")
            if isinstance(reportes, list):
                for rep in reportes[:3]:
                    print(f"  - ID: {rep['id']}, Fecha: {rep['fecha']}, Venta: ${rep['venta_total']}")
        else:
            print(f"Error: {r.text[:200]}")
        
        print("\n=== TEST /api/estadisticas/dashboard/ ===")
        r = requests.get('http://localhost:8000/api/estadisticas/dashboard/', headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            dash = r.json()
            print(f"Total ventas mes: ${dash.get('total_ventas_mes')}")
            print(f"Total gastos mes: ${dash.get('total_gastos_mes')}")
            print(f"Cantidad reportes: {dash.get('cantidad_reportes')}")
        else:
            print(f"Error: {r.text[:500]}")
    else:
        print(f"❌ Login falló: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")
