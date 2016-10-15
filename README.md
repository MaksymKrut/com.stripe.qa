####Stripe Public API Test Automation Framework

####Plus credit card BIN number check

**Installation:**

git clone ***.git

cd ***

npm install

**Start all tests:**

cucumber.js

**Start test for particular scenario:**

cucumber.js --tags @create

**Save output to date named json file:**

a) mkdir local //create gitignored folder

b) cucumber.js --tags @create > "local/$(date +%Y%m%d-%H%M%S).json"

