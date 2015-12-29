# Javaly
### Setup Guide
#### Deployment Quickstart (after initial configuration)
* Running Redis Server
```bash
docker run -d -p 6379:6379 --name redis redis
```
* Running Mongo Server
```bash
docker run -d -p 27017:27017 -p 27016:27016 --name mongodb -v /mnt/javaly/mongodb:/data/db mongo --replSet rs
```
Bash in and run mongod slaves
```
> mongod --replSet rs --port 27016 --dbpath /data/db/rs1 -noprealloc --smallfiles --fork --logpath /data/db/rs1/rs1.log
```
* Running Meteor App
```bash
docker run --rm -it \
    --name meteor \
    --link mongodb:mongodb \
    --link redis:redis \
    -e APP_DIR=/app \
    -v /home/py.ngoh.2014/meteor:/app \
    -v /mnt/javaly/uploads:/uploads \
        -e ROOT_URL=http://kuala.smu.edu.sg \
        -e MONGO_URL=mongodb://mongodb:27017/db \
        -e MONGO_OPLOG_URL=mongodb://oplogger:oplogger@mongodb:27017,mongodb:27016/local?authSource=admin \
   ulexus/meteor
```
* Running the verifier script, ensure that:
    * node is at version 4+
    * docker daemon is running
    * java-verifier container has been built
    
    ```bash
    nohup nodejs meteor-consumer.js > logs.txt 2>&1 &
    #(do not terminate when ssh closes)(pipe stdout/stderr)(run as background process)
    ```
    To kill the script
    ```bash
    ps -aux #find the process ID
    kill <PID>
    ```
     

#### Setting up Mongo Cluster (for Oplog-tailing)
* First, docker in without the replSet flag
    ```bash  
      docker run -d --name mongodb -v /mnt/javaly/mongodb:/data/db mongo    
    ```
  
* Using Localhost Exception, bash + mongo in and create an admin user
    ```bash
    docker exec -it mongodb /bin/bash
    > mongo
    > use admin
    > db.createUser({user: 'admin', pwd: 'admin', roles: [{role: 'userAdminAnyDatabase', db: 'admin'}]})
    ```
  
* Stop the docker container and restart it, now with the replSet flag
    ```bash
    docker run -d -p 27017:27017 -p 27016:27016 --name mongodb -v /mnt/javaly/mongodb:/data/db mongo --replSet rs
    ```
  
* Bash into the container and spawn our mongod slaves
    ```bash
    mkdir /data/db/rs1 
    mongod --replSet rs --port 27016 --dbpath /data/db/rs1 -noprealloc --smallfiles --fork --logpath /data/db/rs1/rs1.log
    ```
* If more slaves are required (but one is enough for oplog)
    ```bash
    mkdir /data/db/rs2
    mongod --replSet rs --port 27015 --dbpath /data/db/rs2 -noprealloc --smallfiles --fork --logpath /data/db/rs2/rs2.log
    ```
  
* Log in to the master shell
    ```bash
    mongo -u admin -p admin --authenticationDatabase admin
    ```
  
* Initiating the replica replSet
    ```bash
    > rs.initiate({_id: 'rs', members: [{_id: 0, host: 'localhost:27017'}, {_id: 1, host: 'localhost:27016'}]})
    ```
  
* Add oplogger user (authenticate into mongo with the admin user we just created)
    ```bash
    > use admin
    > db.createUser({user: 'oplogger', pwd: 'oplogger', roles: [{role: 'read', db: 'local'}]})
    ```

#### Deployment Commands
    
```bash
meteor build --architecture=os.linux.x86_64 ./
scp Javaly.tar.gz py.ngoh.2014@kuala.smu.edu.sg:/home/py.ngoh.2014/meteor/
tar -zxvf Javaly.tar.gz
```
    
#### Backing Up Database
* After bashing into the mongo image
    ```bash
    mongodump —out path/to/backups/<date>
    ```

