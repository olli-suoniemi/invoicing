echo "Creating user..."
echo

ID_TOKEN=$(curl -sk -X POST "https://auth.localhost/identitytoolkit.googleapis.com/v1/accounts:signUp?key=dev" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "test@gmail.com",
    "returnSecureToken": true
  }' \
  | jq -r .idToken)

if [ -z "$ID_TOKEN" ] || [ "$ID_TOKEN" == "null" ]; then
  echo "User creation failed"
  exit 1
else
  echo "User created successfully"
  echo
fi
