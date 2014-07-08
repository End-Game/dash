dash
====

Help system

Setup in Hoist Portal:
----------------------
- Notification template 'support'
- Environment settings: 'googleApiKey' and 'searchEngineId' for google site search key and cx parameters
- Data rule to prevent anonymous saving of models other than comments:
        if(!user && model._type !== 'comment'){
            return false;
        }
        return true;
- Member role permissions for anonymous:
    - Global
        - read file
        - send notification
    - Bucket
        - read data
        - write data