async function test() {
  const presignRes = await fetch("http://localhost:3000/api/uploadthing?actionType=upload&slug=restaurantImage", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name: "test.jpg", size: 12, type: "image/jpeg" }],
      acl: 'public-read',
      endpoint: "restaurantImage"
    })
  });
  const presignData = await presignRes.json();
  const { url } = presignData[0];
  
  // Try multipart PUT
  const formData = new FormData();
  formData.append('file', new Blob(["Hello World!"], { type: "image/jpeg" }), "test.jpg");
  const uploadRes2 = await fetch(url, { method: 'PUT', body: formData });
  
  console.log("Upload status PUT with FormData:", uploadRes2.status);
  console.log("Upload text PUT with FormData:", await uploadRes2.text());
}
test();
