import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_TOKEN =
  'aat.MTAw.eyJ2IjoxLCJ1IjoxMTQ3ODY2LCJkIjoxNTI4ODQ5LCJhaSI6Njc3NjQsImFrIjoiZDdlYjBmNjUtNjZiMS00ZTQ2LWFiNzctYzhmOWJhZDBlZDRjIiwiYW4iOiJUZXN0IEFQSSBBY2N1cmF0ZSIsImFwIjoiMGU5YWY5YjktY2M0ZS00MzgzLWIzYzQtMzdhNjJmOGRiNzk3IiwidCI6MTc3MzM3NDkyOTEwN30.vzCWhtyW+xirepUgQRwC9HSivnwtsvwIAd09R9mIwXjEgh+jBrj8sf8d8ZBiPzb7jeN0cembEM/DXj5HeDcj31hpVfLggUZmoHzHZhrB93Xk0IptCJouwoWsLxHjFOe30slc5QYN9i+tjXXDFL4jlTGKHRcigheKavrNecZO9gS14yv2XykbC7Hr/u5n6MYi44fLhVmRWNE=.AtjvZsyjjSxgU3oFGqpo4bcK8X5oguxHl5h4uzU+rVo';
const SIGNATURE_KEY = 'UuICpjz6Kt0gokT9CPihbLVLb3Yljkh2AEoh8tTYJsBbncrCJw8xg3YxbH9MfI8f';

function getTimestamp(): string {
  return new Date().toISOString();
}

function generateSignature(timestamp: string): string {
  const hash = CryptoJS.HmacSHA256(timestamp, SIGNATURE_KEY);
  return CryptoJS.enc.Base64.stringify(hash);
}

export async function getApi(
  url: string,
  params?: Record<string, unknown> | URLSearchParams
) {
  const timestamp = getTimestamp();
  const signature = generateSignature(timestamp);

  return axios.get(url, {
    params,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    },
  });
}

// Contoh pemanggilan dan console log
export async function testGetGlAccountDetail() {
  const url = 'https://zeus.accurate.id/accurate/api/glaccount/detail.do?no=4101';
  try {
    const response = await getApi(url);
    console.log('GL Account Detail:', response.data);
  } catch (error) {
    console.error('Error fetching GL Account Detail:', error);
  }
}
