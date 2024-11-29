## Deploy github

git add .
git commit -am "commit name"
git push -u origin IQ-Night

## dev-clients გაშვება ფიზიკურ დევაისებზე IOS

-- დევაისების რეგისტრაცია Apple კონსულში
-- იქს კოდში და eas credential -p ios -> production -> ეიფლიდან გადმოწერილი ფაილის მითითება
eas build --profile development --platform ios
