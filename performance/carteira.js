import http from 'k6/http';
import { check } from 'k6';
export const options = {
  vus: 5, duration: '30s',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] },
};
export default function () {
  if (!__ENV.BASE_URL || !__ENV.TOKEN) throw new Error('BASE_URL e TOKEN de laboratório obrigatórios');
  const response = http.get(`${__ENV.BASE_URL}/carteira`, { headers: { Authorization: `Bearer ${__ENV.TOKEN}` } });
  check(response, { 'consulta autorizada': r => r.status === 200 });
}
