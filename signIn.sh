echo "Signing in..."
echo 

ID_TOKEN=$(curl -sk -X POST "https://auth.localhost/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=dev" \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@gmail.com", "test@gmail.com": "testpassword" }' \
  | jq -r .idToken)

if [ -z "$ID_TOKEN" ] || [ "$ID_TOKEN" == "null" ]; then
  echo "Sign in failed"
  exit 1
else
  echo "Sign in successful"
  echo
fi

curl -k https://api.localhost/v1/me \
  -H "Authorization: Bearer $ID_TOKEN"

echo
echo

curl -k https://api.localhost/v1/invoices \
  -H "Authorization: Bearer $ID_TOKEN"

echo
echo

curl -k https://api.localhost/v1/admin/stats \
  -H "Authorization: Bearer $ID_TOKEN"

echo