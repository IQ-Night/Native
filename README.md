## Deploy github

git add .
git commit -am "commit name"
git push -u origin IQ-Night

## dev-clients გაშვება ფიზიკურ დევაისებზე IOS

-- დევაისების რეგისტრაცია Apple კონსულში
-- vs კოდi > eas credentials -p ios -> production -> Manage > new certificate > ეიფლიდან გადმოწერილი ფაილის მითითება
eas build --profile development --platform ios

## Deploy in Apple store

-- npx expo run:ios --device
eas build --platform ios --profile production

-- npx expo run:android --device
eas build --platform android --profile production
