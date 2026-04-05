import fetch from 'node-fetch';
const res = await fetch('http://localhost:3000/api/sectors?country=IN');
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
