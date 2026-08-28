## frontend and backend run 
pnpm dev

cd project/frontend
pnpm run android -- --device

npx expo run:android
npx expo prebuild --clean --platform android && npx expo run:android

ngrok run 
ngrok http 3000 --url https://unwritable-israel-ecclesiological.ngrok-free.dev