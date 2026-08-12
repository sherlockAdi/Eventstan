set -euo pipefail
trap 'echo "FAILED at ${step:-unknown}" >&2' ERR

base='https://api.eventstan.com/api/v1'
event_date='2026-09-04'
event_type='Wedding'
msg1='Need premium decoration and flower entrance.'
msg2='Need premium decoration.'
ts=$(date +%s)
reg_email="api.check.${ts}@example.com"

json_field() {
  python3 - "$1" "$2" <<'PY'
import json, sys
raw = sys.argv[1]
path = sys.argv[2].split('.')
try:
    data = json.loads(raw)
except Exception:
    print('')
    raise SystemExit(0)
cur = data
for key in path:
    if isinstance(cur, list):
        try:
            idx = int(key)
            cur = cur[idx]
            continue
        except Exception:
            print('')
            raise SystemExit(0)
    if not isinstance(cur, dict):
        print('')
        raise SystemExit(0)
    cur = cur.get(key)
    if cur is None:
        print('')
        raise SystemExit(0)
if isinstance(cur, (dict, list)):
    print(json.dumps(cur))
elif cur is None:
    print('')
else:
    print(cur)
PY
}

step='health'
health=$(curl -fsS "$base/health")

step='register'
register=$(curl -fsS -X POST "$base/auth/register" -H 'Content-Type: application/json' -d "{\"name\":\"API Check\",\"email\":\"$reg_email\",\"password\":\"StrongPass123!\"}")
customerId=$(json_field "$register" 'user.id')
if [ -z "$customerId" ]; then
  customerId=$(json_field "$register" 'data.user.id')
fi
if [ -z "$customerId" ]; then
  customerId=$(json_field "$register" 'data.id')
fi
if [ -z "$customerId" ]; then
  echo "Unable to resolve customer id from register response:" >&2
  echo "$register" >&2
  exit 1
fi

step='packages'
packages=$(curl -fsS "$base/packages")
packageIds=$(python3 - "$packages" <<'PY'
import json, sys
raw = sys.argv[1]
try:
    data = json.loads(raw)
except Exception:
    data = {}
items = None
if isinstance(data, list):
    items = data
elif isinstance(data, dict):
    if isinstance(data.get('data'), list):
        items = data['data']
    elif isinstance(data.get('data'), dict):
        items = data['data'].get('items', [])
    else:
        items = data.get('items', [])
else:
    items = []
for item in items[:2]:
    print(item.get('id', ''))
PY
)
pkg1=$(echo "$packageIds" | sed -n '1p')
pkg2=$(echo "$packageIds" | sed -n '2p')
if [ -z "$pkg1" ] || [ -z "$pkg2" ]; then
  echo "Need at least two active packages." >&2
  echo "$packages" >&2
  exit 1
fi

step='add cart 1'
add1=$(curl -fsS -X POST "$base/customer/cart" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\",\"packageId\":\"$pkg1\",\"quantity\":1}")
item1Id=$(json_field "$add1" 'data.cartItemId')

step='add cart 2'
add2=$(curl -fsS -X POST "$base/customer/cart" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\",\"packageId\":\"$pkg2\",\"quantity\":1}")
item2Id=$(json_field "$add2" 'data.cartItemId')

step='get cart'
cart=$(curl -fsS "$base/customer/cart/$customerId")

step='update cart'
update=$(curl -fsS -X PUT "$base/customer/cart/$item1Id" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\",\"quantity\":2}")

step='remove cart'
remove=$(curl -fsS -X DELETE "$base/customer/cart/$item2Id" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\"}")

step='book now'
bookNow=$(curl -fsS -X POST "$base/customer/book-now" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\",\"packageId\":\"$pkg2\",\"eventDate\":\"$event_date\",\"eventType\":\"$event_type\",\"guestCount\":500,\"message\":\"$msg1\"}")

step='checkout'
checkout=$(curl -fsS -X POST "$base/customer/checkout" -H 'Content-Type: application/json' -d "{\"userId\":\"$customerId\",\"cartItemIds\":[\"$item1Id\"],\"eventDate\":\"$event_date\",\"eventType\":\"$event_type\",\"guestCount\":500,\"message\":\"$msg2\",\"paymentMethod\":\"pay_on_confirmation\"}")

step='cart after checkout'
cartAfter=$(curl -fsS "$base/customer/cart/$customerId")

python3 - "$health" "$register" "$add1" "$add2" "$cart" "$update" "$remove" "$bookNow" "$checkout" "$cartAfter" <<'PY'
import json, sys

def parse(raw):
    try:
        return json.loads(raw)
    except Exception:
        return raw

health, register, add1, add2, cart, update, remove, book_now, checkout, cart_after = map(parse, sys.argv[1:])

summary = {
    "health": health,
    "register": {
        "ok": True,
        "userId": (((register.get("user") or register.get("data") or {}).get("id"))
                   if isinstance(register, dict) else None),
    } if isinstance(register, dict) else register,
    "addToCart_1": add1,
    "addToCart_2": add2,
    "cartList": cart,
    "cartUpdate": update,
    "cartRemove": remove,
    "bookNow": book_now,
    "checkout": checkout,
    "cartAfterCheckout": cart_after,
}
print(json.dumps(summary, indent=2))
PY
