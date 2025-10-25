import { NextResponse } from 'next/server';
import { getCookie } from '../../../utils/cookies';
import { apiURL } from '@/utils/apiUrl';

export async function GET(req) {
  // Extract the token from the HttpOnly cookie
  const token = getCookie(req, 'token');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token found' }, { status: 401 });
  }

  try {
    // Fetch data from the API using the token from the cookies
    const response = await fetch(`${apiURL}/v1/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data from API');
    }

    const data = await response.json();
    return NextResponse.json({ message: 'Fetch successful', data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Create a new product
export async function POST(req) {
  // Extract the token from the HttpOnly cookie
  const token = getCookie(req, 'token');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token found' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  try {
    // Fetch data from the API using the token from the cookies
    const response = await fetch(`${apiURL}/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data from API');
    }

    const data = await response.json();
    return NextResponse.json({ message: 'Fetch successful', data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
