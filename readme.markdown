# Countries

A very simple micro-service for supplying country information

## Running

It's very simple to build and run using docker

* Building

This is optional, as you can use the currently published docker version

```
docker build -t lsmoura/countries .
```

* Running

```
docker run --rm -d -p 3000:3000 lsmoura/countries
```

After issuing the command above, you can start making queries

## Using

Just do HTTP calls to the microservice. There is no database nor authentication needed. 
Everything needed is loaded into memory when the container is started.

* Retrieve every country

`curl http://localhost:3000/`

* Retrieve a single country by "alpha2"

`curl http://localhost:3000/ca`

* Retrieve a single country by "alpha3"

`curl http://localhost:3000/usa`

* Retrieve a single country by "numeric code"

`curl http://localhost:3000/76`

# Author

* [Sergio Moura](https://sergio.moura.ca) https://sergio.moura.ca
