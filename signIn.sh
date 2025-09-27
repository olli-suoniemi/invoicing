ID_TOKEN=$(curl -sk -X POST "https://auth.localhost/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=dev" \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@gmail.com", "password": "testpassword" }' \
  | jq -r .idToken)

echo

curl -k https://api.localhost/v1/me \
  -H "Authorization: Bearer $ID_TOKEN"

echo
echo

curl -k https://api.localhost/v1/db-ping \
  -H "Authorization: Bearer $ID_TOKEN"

echo
echo

curl -k https://api.localhost/v1/admin/stats \
  -H "Authorization: Bearer $ID_TOKEN"

echo