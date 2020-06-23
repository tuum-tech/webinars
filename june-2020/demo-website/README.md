## Prerequisites

Python3 and Django are required to run this build. First, install Python3:

```
brew install python3 // On Mac
sudo apt-get install python3 // On Ubuntu
```

Now install virtualenv by running the following:

```
pip3 install virtualenv
```

## How to Run

Copy the environment example file
```
yes | cp -rf .env.example .env
```

Set the following only if you want to test signup/login using Elephant Wallet. Otherwise, it's not needed:
```
# Replace '192.168.1.23' with your own IP address(cannot be localhost)
ALLOWED_HOSTS=.127.0.0.1, .localhost, .192.168.1.23
# Replace '192.168.1.23' with your own IP address(cannot be localhost)
APP_URL=http://192.168.1.23:8000
DEVELOPMENT=False
```
Run the automated script to set up everything and start Django server:
```
./run.sh
```

The console can be viewed on at [http://127.0.0.1:8000](http://127.0.0.1:8000)

You can also use the admin interface at [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

## Debugging

Interact with your database:

```
# Connect to postgresql database
docker container exec -it demo-website-postgres psql -h localhost -U demo -d demo-website
# Look at the tables
\dt
# Get all items from the table 'login_didrequest'
select * from login_didrequest;
```

Check all the available url routing currently available by the project

```
python3 manage.py show_urls
```
