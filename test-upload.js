const fs = require('fs');
async function test() {
  const presignRes = await fetch("http://localhost:3000/api/uploadthing?actionType=upload&slug=restaurantImage", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name: "test.txt", size: 12, type: "text/plain" }],
      acl: 'public-read',
      endpoint: "restaurantImage"
    })
  });
  const presignData = await presignRes.json();
  console.log("Presign:", presignData);
  
  const { url } = presignData[0];
  
  // Try direct PUT
  const uploadRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline'
    },
    body: "Hello World!"
  });
  
  console.log("Upload status:", uploadRes.status);
  console.log("Upload text:", await uploadRes.text());
}
test();
