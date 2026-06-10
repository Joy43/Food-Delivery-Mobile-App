## frontend and backend run 
pnpm dev

cd project/frontend
pnpm run android -- --device

npx expo run:android
npx expo prebuild --clean --platform android && npx expo run:android