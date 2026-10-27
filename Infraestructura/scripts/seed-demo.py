#!/usr/bin/env python3
"""Seed de datos demo — puebla el sistema completo vía APIs reales.

Uso (con la plataforma arriba):
    python Infraestructura/scripts/seed-demo.py

Crea (idempotente — omite lo que ya existe):
  - 4 clientes + 3 carpinteros + 6 pedidos con items (GraphQL, como ADMIN)
  - asignaciones de carpinteros, entregas programadas, pasos de producción
  - 3 cotizaciones vía gateway (como CLIENT, con foto Cloudinary)
  - 2 pagos Stripe test → facturas reales por RabbitMQ → billing
  - materiales/stock vía SQL directo (tabla sin API)

Requiere: gateway :3000, business :8080, billing :8001, postgres :15432.
"""
import json
import sys
import urllib.request
import uuid

GW = "http://localhost:3000"
GQL = f"{GW}/graphql"
ADMIN = ("admin@carpinteria.com", "admin123")
CLIENT = ("cliente@carpinteria.com", "cliente123")

CLOUD = "https://res.cloudinary.com/dwerzrgya/image/upload/c_fill,w_800,h_500,q_auto,f_auto/carpinteria/catalog"


def req(method, url, body=None, token=None, internal=False):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    if internal:
        h["x-internal-secret"] = "carpinteria-internal-dev"
    r = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"__error": e.code, "detail": e.read()[:300].decode(errors="replace")}


def login(email, password):
    d = req("POST", f"{GW}/auth/login", {"email": email, "password": password})
    if "accessToken" not in d:
        sys.exit(f"FALLO login {email}: {d}")
    return d["accessToken"]


def gql(token, query, variables=None):
    d = req("POST", GQL, {"query": query, "variables": variables}, token)
    if "errors" in d:
        return None, d["errors"][0].get("message", "?")
    return d.get("data"), None


def main():
    print("== Seed demo carpinteria ==")
    admin = login(*ADMIN)
    client_tok = login(*CLIENT)
    print("login admin+cliente OK")

    # ---------- Clientes (CU1) ----------
    clients = [
        ("Cliente Demo", "cliente@carpinteria.com", "70123456", "Av. Busch 123, Santa Cruz"),
        ("Ana Martínez", "ana@cliente.com", "71234567", "Calle Libertad 45"),
        ("Hotel Los Tajibos", "eventos@tajibos.bo", "33445566", "Av. San Martín 455"),
        ("Constructora Andina", "compras@andina.bo", "44556677", "Parque Industrial Mz 12"),
    ]
    existing, _ = gql(admin, "{ clients { id email } }")
    by_email = {c["email"]: c["id"] for c in (existing or {}).get("clients", [])}
    for name, email, phone, addr in clients:
        if email in by_email:
            continue
        data, err = gql(admin, 'mutation($i: CreateClientInput!){ createClient(input:$i){ id email } }',
                        {"i": {"name": name, "email": email, "phone": phone, "address": addr}})
        if err:
            print(f"  cliente {email}: {err}")
        else:
            by_email[email] = data["createClient"]["id"]
    print(f"clientes: {len(by_email)}")

    # ---------- Carpinteros (CU2) ----------
    carps = [
        ("José Rojas", "carpintero@carpinteria.com", "72345678", "Roperos y melamina", 12, 45.0),
        ("Marco Suárez", "marco@taller.com", "73456789", "Muebles finos en mara", 20, 60.0),
        ("Elena Paz", "elena@taller.com", "74567890", "Cocinas integrales", 8, 40.0),
    ]
    existing, _ = gql(admin, "{ carpenters { id email } }")
    carp_by_email = {c["email"]: c["id"] for c in (existing or {}).get("carpenters", [])}
    for name, email, phone, spec, yrs, rate in carps:
        if email in carp_by_email:
            continue
        data, err = gql(admin, 'mutation($i: CreateCarpenterInput!){ createCarpenter(input:$i){ id } }',
                        {"i": {"name": name, "email": email, "phone": phone,
                               "specialty": spec, "yearsExperience": yrs, "hourlyRate": rate}})
        if err:
            print(f"  carpintero {email}: {err}")
        else:
            carp_by_email[email] = data["createCarpenter"]["id"]
    carp_ids = list(carp_by_email.values())
    print(f"carpinteros: {len(carp_ids)}")

    # ---------- Pedidos (CU3/CU4 lado negocio) ----------
    orders = [
        ("cliente@carpinteria.com", "Ropero empotrado 4 puertas cedro",
         [("Ropero 4p cedro", "WARDROBE", "CEDRO", 1, 4200)], "IN_PRODUCTION"),
        ("ana@cliente.com", "Juego de comedor 6 sillas mara",
         [("Mesa comedor", "TABLE", "MARA", 1, 2800), ("Sillas", "CHAIR", "MARA", 6, 650)], "APPROVED"),
        ("cliente@carpinteria.com", "Escritorio home-office roble",
         [("Escritorio", "DESK", "ROBLE", 1, 1900)], "READY"),
        ("eventos@tajibos.bo", "Amueblado recepción hotel",
         [("Recepción", "DESK", "MELAMINA", 1, 8500), ("Estantería", "BOOKSHELF", "MELAMINA", 2, 2100)], "IN_PRODUCTION"),
        ("compras@andina.bo", "Cocina integral melamina",
         [("Cocina integral", "KITCHEN_CABINET", "MELAMINA", 1, 6800)], "PENDING"),
        ("cliente@carpinteria.com", "Puerta principal tallada",
         [("Puerta principal", "DOOR", "MARA", 1, 1600)], "DELIVERED"),
    ]
    existing, _ = gql(admin, "{ orders { id description status } }")
    have_desc = {o["description"] for o in (existing or {}).get("orders", [])}
    made_orders = []
    for cemail, desc, items, status in orders:
        if desc in have_desc:
            continue
        cid = by_email.get(cemail)
        if not cid:
            continue
        gql_items = [{"description": d, "furnitureType": f, "woodType": w, "quantity": q, "unitPrice": p}
                     for d, f, w, q, p in items]
        data, err = gql(admin,
            'mutation($i: CreateOrderInput!){ createOrder(input:$i){ id } }',
            {"i": {"clientId": cid, "description": desc, "items": gql_items}})
        if err:
            print(f"  pedido {desc[:30]}: {err}")
            continue
        oid = data["createOrder"]["id"]
        made_orders.append((oid, status))
        # Máquina de estados del dominio: PENDING→APPROVED→IN_PRODUCTION→READY→DELIVERED
        path = ["APPROVED", "IN_PRODUCTION", "READY", "DELIVERED"]
        for s in path[: path.index(status) + 1] if status in path else []:
            gql(admin, 'mutation($id:ID!,$s:OrderStatus!){ updateOrderStatus(id:$id,status:$s){ id } }',
                {"id": oid, "s": s})
        # asignar carpintero en rotación
        if carp_ids:
            gql(admin, 'mutation($o:ID!,$c:ID!){ assignCarpenter(orderId:$o,carpenterId:$c){ id } }',
                {"o": oid, "c": carp_ids[len(made_orders) % len(carp_ids)]})
    print(f"pedidos creados: {len(made_orders)} (+{len(have_desc)} ya existían)")

    # ---------- Entregas (CU4) ----------
    delivery_dates = ["2026-10-28", "2026-10-29", "2026-11-03", "2026-11-05"]
    for i, (oid, status) in enumerate(made_orders):
        if status in ("PENDING", "CANCELLED"):
            continue
        gql(admin, 'mutation($i: ScheduleDeliveryInput!){ scheduleDelivery(input:$i){ id } }',
            {"i": {"orderId": oid, "scheduledDate": delivery_dates[i % len(delivery_dates)],
                   "timeSlot": ["MORNING", "AFTERNOON"][i % 2],
                   "address": "Dirección cliente demo", "notes": "Coordinar por teléfono"}})
    print(f"entregas intentadas: {len(made_orders)}")

    # ---------- Cotizaciones + pagos (CU3/CU6, como CLIENT) ----------
    quotes = [
        ("Mesa de comedor mara 1.8m", "TABLE", "MARA", 1, 2800, "catalog-table"),
        ("Ropero 3 puertas melamina", "WARDROBE", "MELAMINA", 1, 3100, "catalog-wardrobe"),
        ("Escritorio roble con gavetas", "DESK", "ROBLE", 1, 1950, "catalog-desk"),
    ]
    paid = 0
    for desc, ftype, wood, qty, price, img in quotes:
        q = req("POST", f"{GW}/api/quotations", {
            "clientId": CLIENT[0],
            "photoUrl": f"{CLOUD}/{img}.jpg",
            "requestEstimate": True,
            "items": [{"description": desc, "furnitureType": ftype, "woodType": wood,
                        "quantity": qty, "unitPrice": price}],
        }, client_tok)
        if "__error" in q:
            print(f"  cotización {desc[:25]}: HTTP {q['__error']} {q['detail'][:80]}")
            continue
        qid = q["id"]
        if paid < 2:  # pagar solo las 2 primeras → 2 facturas + 1 pendiente
            p = req("POST", f"{GW}/api/payments", {
                "quotationId": qid, "clientId": CLIENT[0], "amount": price * qty,
                "currency": "BOB", "cardNumber": "4242424242424242",
                "cardHolder": "Cliente Demo", "expiryMonth": 12, "expiryYear": 2027, "cvv": "123",
            }, client_tok)
            ok = p.get("status") == "COMPLETED"
            print(f"  pago {qid[:8]}…: {p.get('status')} ({p.get('gatewayTransactionId','-')})")
            paid += ok
    print(f"pagos Stripe OK: {paid}")

    # ---------- Materiales (sin API → SQL directo) ----------
    try:
        import subprocess
        sql = """
        INSERT INTO materials (name, wood_type, stock_m3, min_stock_m3, unit_price)
        SELECT * FROM (VALUES
          ('Tablero melamina 18mm','MELAMINA',45.0,10.0,320.0),
          ('Madera mara','MARA',12.5,4.0,980.0),
          ('Madera roble','ROBLE',8.0,3.0,1250.0),
          ('Madera cedro','CEDRO',15.2,5.0,760.0),
          ('Madera pino','PINO',30.0,8.0,420.0),
          ('Bisagras cierre suave',NULL,200,50,18.0),
          ('Cola carpintero 1kg',NULL,25,8,45.0)
        ) AS v(name, wood_type, stock_m3, min_stock_m3, unit_price)
        WHERE NOT EXISTS (SELECT 1 FROM materials m WHERE m.name = v.name);
        """
        r = subprocess.run(["docker", "exec", "carpinteria-postgres", "psql",
                            "-U", "carpinteria", "-d", "carpinteria", "-c", sql],
                           capture_output=True, text=True, timeout=20)
        print("materiales:", r.stdout.strip() or r.stderr.strip()[:120])
    except Exception as e:
        print(f"materiales: (saltado — {e})")

    # ---------- Resumen ----------
    inv = req("GET", f"{GW}/api/invoices", token=admin)
    total_inv = inv.get("total", "?") if isinstance(inv, dict) else "?"
    print(f"\nFacturas en billing: {total_inv}")
    print("Listo. Portal :4200 · Admin :4202 · Taller :4204")


if __name__ == "__main__":
    main()
