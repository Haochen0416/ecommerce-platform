
#!/usr/bin/env bash
# Smoke test for auth endpoints. Requires the API running on $BASE.
BASE="${BASE:-http://127.0.0.1:8000}"
U="smoke$(date +%s)"
P="smokepass123"
FAIL=0

check() {  # name, expected-regex, actual
  if [[ "$3" =~ ^($2)$ ]]; then echo "PASS  $1 ($3)"; else echo "FAIL  $1 (expected $2, got $3)"; FAIL=1; fi
}
req() {    # prints "<status>|<body>"
  local out; out=$(curl -s -w $'\n%{http_code}' "$@"); echo "${out##*$'\n'}|${out%$'\n'*}"
}
json='-H Content-Type:application/json'

r=$(req -X POST $BASE/auth/register $json -d "{\"username\":\"$U\",\"email\":\"$U@example.com\",\"password\":\"$P\"}")
check "register new user"            "200|201" "${r%%|*}"
[[ "${r#*|}" == *password* ]] && { echo "FAIL  register leaks password field"; FAIL=1; } || echo "PASS  register response has no password field"

r=$(req -X POST $BASE/auth/register $json -d "{\"username\":\"$U\",\"email\":\"x$U@example.com\",\"password\":\"$P\"}")
check "duplicate username"           "400|409" "${r%%|*}"

r=$(req -X POST $BASE/auth/register $json -d "{\"username\":\"x$U\",\"email\":\"$U@example.com\",\"password\":\"$P\"}")
check "duplicate email"              "400|409" "${r%%|*}"

r=$(req -X POST $BASE/auth/register $json -d "{\"username\":\"y$U\",\"email\":\"y$U@example.com\",\"password\":\"$(printf 'a%.0s' {1..80})\"}")
check "password 80 ASCII chars"      "422" "${r%%|*}"
[[ "${r#*|}" == *'"input"'* ]] && { echo "FAIL  422 echoes input"; FAIL=1; } || echo "PASS  422 does not echo input"

r=$(req -X POST $BASE/auth/register $json -d "{\"username\":\"z$U\",\"email\":\"z$U@example.com\",\"password\":\"$(printf '密%.0s' {1..30})\"}")
check "password 90 bytes (CJK)"      "422" "${r%%|*}"

r=$(req -X POST $BASE/auth/login -d "username=$U&password=$P")
check "login correct password"       "200" "${r%%|*}"
TOKEN=$(echo "${r#*|}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

r=$(req -X POST $BASE/auth/login -d "username=$U&password=wrong")
check "login wrong password"         "401" "${r%%|*}"

r=$(req $BASE/auth/me -H "Authorization: Bearer $TOKEN")
check "/auth/me valid token"         "200" "${r%%|*}"

r=$(req $BASE/auth/me -H "Authorization: Bearer garbage")
check "/auth/me invalid token"       "401" "${r%%|*}"

r=$(req $BASE/auth/me)
check "/auth/me no token"            "401" "${r%%|*}"

echo; [[ $FAIL -eq 0 ]] && echo "ALL PASSED" || echo "SOME TESTS FAILED"
exit $FAIL
