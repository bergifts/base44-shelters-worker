import 'dotenv/config';
import fetch from 'node-fetch';

const { BASE44_APP_ID, BASE44_API_KEY, SHELTER_RES_ID } = process.env;

async function main() {
  try {
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${SHELTER_RES_ID}&limit=5000`;
    const raw = await fetch(url).then(r => r.json());
    const rows = raw.result.records;

    const payload = rows.map(r => ({
      external_id: r._id,
      name: r.name || r.address,
      address: r.address,
      city: r.city,
      coordinates: { lat: +r.lat, lng: +r.lon },
      accessibility: r.accessible === 'כן'
    }));

    const res = await fetch(`https://app.base44.com/api/apps/${BASE44_APP_ID}/functions/upsertShelters`, {
      method: 'POST',
      headers: { 'api_key': BASE44_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload })
    });

    const txt = await res.text();
    console.log('✔ sent to BASE44:', txt);
  } catch (err) {
    console.error('❌ fetchShelters error:', err);
  }
}

main();